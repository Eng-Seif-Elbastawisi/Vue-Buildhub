import { baseUrl } from '@/base/Core/NetworkStructure/baseUrl'
import { Client, type StompSubscription, type IFrame } from '@stomp/stompjs'
import { ref, type Ref } from 'vue'

export interface WebSocketConfig {
  brokerURL: string 
  reconnectDelay: number
  heartbeatIncoming: number
  heartbeatOutgoing: number
  debug: boolean
  maxReconnectAttempts?: number
  connectionTimeout?: number
}

interface NotificationBody {
  from: string
  message: string
  timestamp: string
  title: string
  type: number
  type_id: number
}

export interface Notification {
  id: string
  title: string
  isBroadcast?: boolean
  targetUserId?: string
  message?: string
  readStatus?: 'READ' | 'UNREAD'
  // Legacy UI field; derived from readStatus during normalization.
  status?: 'READ' | 'PENDING'
  data?: { type: number; type_id: number }
  body?: NotificationBody[]
  [key: string]: any
}
export interface EnrichedNotification extends Notification {
  type: NotificationType
  receivedAt: Date
  parsedBody: Record<string, any>
  displayMessage: string
  routeType?: number
  routeTypeId?: number
}

export interface NotificationCount {
  read: number
  unread: number
  total: number
}

export type NotificationType = 'broadcast' | 'direct' | 'pending'
type EventHandler = (data: any) => void

class WebSocketNotificationService {
  private client: Client | null
  public connected: Ref<boolean>
  public error: Ref<string | null>
  public notifications: Ref<EnrichedNotification[]>
  public acknowledgeCount: Ref<number>
  public logs: Ref<string[]>
  public unreadCount: Ref<number | string>
  public notificationCount: Ref<NotificationCount>

  private processedNotificationIds: Set<string>
  private subscriptions: Map<string, StompSubscription>
  private config: WebSocketConfig
  private eventHandlers: Map<string, EventHandler[]>
  private reconnectAttempts: number
  private connectionTimeout: NodeJS.Timeout | null
  private connectionPromise: Promise<IFrame | void> | null
  private isManualDisconnect: boolean
  private usesNotificationCountEndpoint: boolean

  constructor() {
    this.client = null
    this.connected = ref(false)
    this.error = ref(null)
    this.notifications = ref([])
    this.logs = ref([])
    this.processedNotificationIds = new Set()
    this.subscriptions = new Map()
    this.config = {
      brokerURL: 'wss://socket.techlabeg.com/ws',
      reconnectDelay: 50000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: true,
      maxReconnectAttempts: 5,
      connectionTimeout: 30000,
    }
    this.eventHandlers = new Map()
    this.reconnectAttempts = 0
    this.connectionTimeout = null
    this.connectionPromise = null
    this.isManualDisconnect = false
    this.usesNotificationCountEndpoint = false
    this.acknowledgeCount = ref(0)
    this.unreadCount = ref(0)
    this.notificationCount = ref({ read: 0, unread: 0, total: 0 })
  }

  /**
   * Configure the service
   */
  configure(options: Partial<WebSocketConfig> = {}): this {
    this.config = { ...this.config, ...options }
    // Ensure WSS protocol for secure connections
    if (this.config.brokerURL.startsWith('ws://') && !this.config.brokerURL.includes('localhost')) {
      this.config.brokerURL = this.config.brokerURL.replace('ws://', 'wss://')
      this.addLog('⚠ Switched to secure WebSocket (wss://)')
    }
    return this
  }

  /**
   * Add a log entry
   */
  addLog(message: string): void {
    const timestamp = new Date().toLocaleTimeString()
    this.logs.value.push(`[${timestamp}] ${message}`)
    if (this.config.debug) {
      console.log(message)
    }
  }

  /**
   * Register an event handler
   */
  on(event: string, handler: EventHandler): this {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, [])
    }
    this.eventHandlers.get(event)?.push(handler)
    return this
  }

  /**
   * Remove an event handler
   */
  off(event: string, handler?: EventHandler): this {
    if (!handler) {
      this.eventHandlers.delete(event)
    } else {
      const handlers = this.eventHandlers.get(event)
      if (handlers) {
        const index = handlers.indexOf(handler)
        if (index > -1) {
          handlers.splice(index, 1)
        }
      }
    }
    return this
  }

  /**
   * Emit an event
   */
  emit(event: string, data?: any): void {
    const handlers = this.eventHandlers.get(event) || []
    handlers.forEach((handler) => {
      try {
        handler(data)
      } catch (error: any) {
        this.addLog(`❌ Error in event handler for ${event}: ${error.message}`)
      }
    })
  }

  /**
   * Safely parse notification body from API/WebSocket payloads.
   */
  private parseNotificationBody(body: Notification['body']): Record<string, any> {
    if (!body) return {}

    if (typeof body === 'object') {
      return body
    }

    try {
      const parsed = JSON.parse(body)
      return parsed && typeof parsed === 'object' ? parsed : {}
    } catch {
      return {}
    }
  }

  /**
   * Normalize live and fetched notifications into one UI-safe shape.
   */
  private normalizeNotification(
    notification: Notification,
    type: NotificationType,
  ): EnrichedNotification {
    console.log('Normalizing notification:', notification, 'Type:', type)
    const parsedBody = this.parseNotificationBody(notification?.body?.[0] ?? null)
    const bodyMessage = typeof parsedBody.message === 'string' ? parsedBody.message : ''
    const plainBody = notification?.body?.[0]?.message
    const receivedAtSource =
      notification.receivedAt ||
      parsedBody.timestamp ||
      notification.created_at ||
      notification.createdAt
    const receivedAt = receivedAtSource ? new Date(receivedAtSource) : new Date()
    const readStatus =
      notification.readStatus ?? (notification.status === 'READ' ? 'READ' : 'UNREAD')

    return {
      ...notification,
      readStatus,
      status: readStatus === 'READ' ? 'READ' : 'PENDING',
      type,
      receivedAt: Number.isNaN(receivedAt.getTime()) ? new Date() : receivedAt,
      parsedBody,
      displayMessage: notification.message || bodyMessage || plainBody || '',
      routeType: notification.data?.type ?? parsedBody.data?.type,
      routeTypeId: notification.data?.type_id ?? parsedBody.data?.type_id,
    }
  }

  private recalculateUnreadCount(): void {
    if (this.usesNotificationCountEndpoint) {
      return
    }

    const unread = this.notifications.value.filter(
      (notification) => notification.readStatus === 'UNREAD',
    ).length

    this.notificationCount.value = {
      read: this.notifications.value.length - unread,
      unread,
      total: this.notifications.value.length,
    }
    this.unreadCount.value = this.formatUnreadCount(unread)
  }

  private formatUnreadCount(unread: number): number | string {
    return unread > 100 ? '+99' : unread
  }

  private normalizeCount(value: unknown): number {
    const count = Number(value)
    return Number.isFinite(count) && count > 0 ? count : 0
  }

  private applyNotificationCount(count: Partial<NotificationCount>): void {
    const read = this.normalizeCount(count.read)
    const unread = this.normalizeCount(count.unread)
    const total = this.normalizeCount(count.total ?? read + unread)

    this.notificationCount.value = { read, unread, total }
    this.unreadCount.value = this.formatUnreadCount(unread)
    this.usesNotificationCountEndpoint = true
  }

  private updateNotificationCount(changes: Partial<NotificationCount>): void {
    if (!this.usesNotificationCountEndpoint) {
      this.recalculateUnreadCount()
      return
    }

    const current = this.notificationCount.value
    this.applyNotificationCount({
      read: current.read + (changes.read ?? 0),
      unread: current.unread + (changes.unread ?? 0),
      total: current.total + (changes.total ?? 0),
    })
  }

  /**
   * Handle incoming notifications
   */
  handleNotification(notification: Notification, type: NotificationType): void {
    // Prevent duplicates
    console.log('Received notification:', notification)
    if (this.processedNotificationIds.has(notification.messageId)) {
      this.addLog(`⚠ Duplicate ${type} notification ignored: ${notification.messageId}`)
      return
    }

    const typeIcon: Record<NotificationType, string> = {
      broadcast: '📢',
      direct: '📩',
      pending: '⏳',
    }

    this.addLog(`${typeIcon[type] || '📬'} ${type}: ${notification.title} (ID: ${notification.id})`)

    const enrichedNotification = this.normalizeNotification(notification, type)
    this.notifications.value.unshift(enrichedNotification)
    this.processedNotificationIds.add(notification.messageId)
    if (enrichedNotification.readStatus === 'UNREAD') {
      this.updateNotificationCount({ unread: 1, total: 1 })
    } else {
      this.updateNotificationCount({ read: 1, total: 1 })
    }

    // Emit event for external handlers
    this.emit('notification', enrichedNotification)
    this.emit(`notification:${type}`, enrichedNotification)
  }

  /**
   * Mark a notification as read on the WebSocket server.
   */
  acknowledgeNotification(notificationId: string): void {
    if (!this.client || !this.client.connected) {
      this.addLog(`⚠ Cannot mark notification ${notificationId} as read: Not connected`)
      return
    }

    const notification = this.notifications.value.find((item) => item.id === notificationId)
    if (notification?.readStatus === 'READ') {
      return
    }

    try {
      console.log('Acknowledging notification:', notificationId)
      this.client.publish({
        destination: '/app/messages/read',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messageId: notificationId }),
      })

      if (notification) {
        notification.readStatus = 'READ'
        notification.status = 'READ'
        this.updateNotificationCount({ read: 1, unread: -1 })
        this.emit('notifications:updated', this.notifications.value)
        this.emit('notification:read', notification)
      }

      this.acknowledgeCount.value += 1
      this.addLog(`✓ Notification marked as read: ${notificationId}`)
      this.emit('acknowledged', notificationId)
    } catch (error: any) {
      this.addLog(`❌ Failed to mark notification as read: ${error.message}`)
    }
  }

  /**
   * Subscribe to a channel
   */
  subscribe(
    destination: string,
    handler: (data: any, channelType?: string) => void,
    channelType: string = 'custom',
  ): StompSubscription | null {
    if (!this.client || !this.client.connected) {
      this.addLog('⚠ Cannot subscribe: Not connected')
      return null
    }

    try {
      this.unsubscribe(destination)

      const subscription = this.client.subscribe(destination, (message) => {
        try {
          const data = message.body ? JSON.parse(message.body) : null
          handler(data, channelType)
        } catch (error: any) {
          this.addLog(`❌ Error parsing message from ${destination}: ${error.message}`)
        }
      })

      this.subscriptions.set(destination, subscription)
      this.addLog(`✓ Subscribed to ${destination}`)
      return subscription
    } catch (error: any) {
      this.addLog(`❌ Failed to subscribe to ${destination}: ${error.message}`)
      return null
    }
  }

  /**
   * Unsubscribe from a channel
   */
  unsubscribe(destination: string): void {
    const subscription = this.subscriptions.get(destination)
    if (subscription) {
      try {
        subscription.unsubscribe()
        this.subscriptions.delete(destination)
        this.addLog(`✓ Unsubscribed from ${destination}`)
      } catch (error: any) {
        this.addLog(`❌ Error unsubscribing from ${destination}: ${error.message}`)
      }
    }
  }

  /**
   * Setup default notification channels
   */
  setupDefaultChannels(): void {
    // Broadcast notifications
    this.subscribe(
      '/topic/notifications',
      (notification) => {
        this.handleNotification(notification, 'broadcast')
      },
      'broadcast',
    )

    // Direct notifications
    this.subscribe(
      '/user/queue/notifications',
      (notification) => {
        this.handleNotification(notification, 'direct')
      },
      'direct',
    )

    // Pending/unacknowledged notifications
    this.subscribe(
      '/user/queue/pending',
      (data) => {
        console.log('data', data)
        const pendingCount = Array.isArray(data) ? data.length : 0
        this.addLog(`📦 Received ${pendingCount} pending/unacknowledged notifications`)

        if (Array.isArray(data)) {
          this.addLog(`data ${data}`)
          data.forEach((notification) => {
            const type: NotificationType = notification.isBroadcast
              ? 'broadcast'
              : notification.targetUserId
                ? 'direct'
                : 'pending'
            this.handleNotification(notification, type)
          })
        }
      },
      'pending',
    )

    // Acknowledgments
    this.subscribe(
      '/user/queue/ack',
      (ack) => {
        this.addLog(`ACK received for: ${ack}`)

        this.addLog(`✓ Server confirmed ACK for: ${ack}`)
        this.emit('ack:confirmed', ack)
      },
      'ack',
    )
  }

  /**
   * Clear connection timeout
   */
  private clearConnectionTimeout(): void {
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout)
      this.connectionTimeout = null
    }
  }

  /**
   * Connect to WebSocket server
   */
  connect(token: string): Promise<IFrame | void> {
    if (this.client && this.client.connected) {
      this.addLog('⚠ Already connected')
      return Promise.resolve()
    }

    if (this.client?.active && this.connectionPromise) {
      this.addLog('⚠ Connection already in progress')
      return this.connectionPromise
    }

    if (this.client?.active) {
      this.addLog('⚠ WebSocket client already active')
      return Promise.resolve()
    }

    this.isManualDisconnect = false

    this.connectionPromise = new Promise((resolve, reject) => {
      this.addLog(`🔌 Connecting to WebSocket... (Attempt ${this.reconnectAttempts + 1})`)

      // Set connection timeout
      // this.connectionTimeout = setTimeout(() => {
      //     this.addLog('❌ Connection timeout')
      //     this.error.value = 'Connection timeout'
      //     if (this.client) {
      //         this.client.deactivate()
      //     }
      //     reject(new Error('Connection timeout'))
      // }, this.config.connectionTimeout || 30000)

      this.client = new Client({
        brokerURL: this.config.brokerURL,
        connectHeaders: {
          token,
        },
        debug: (str) => {
          if (this.config.debug && str.length < 200) {
            this.addLog(`STOMP: ${str}`)
          }
        },
        reconnectDelay: this.config.reconnectDelay,
        heartbeatIncoming: this.config.heartbeatIncoming,
        heartbeatOutgoing: this.config.heartbeatOutgoing,

        onConnect: (frame) => {
          this.clearConnectionTimeout()
          this.connectionPromise = null
          this.addLog('✅ CONNECTED!')
          this.connected.value = true
          this.error.value = null
          this.reconnectAttempts = 0

          // Setup default channels
          this.setupDefaultChannels()

          // Request pending notifications
          this.requestPendingNotifications()

          this.emit('connected', frame)
          resolve(frame)
        },

        onStompError: (frame) => {
          this.clearConnectionTimeout()
          this.connectionPromise = null
          const errorMsg = frame.headers['message'] || 'STOMP protocol error'
          this.addLog(`❌ STOMP Error: ${errorMsg}`)
          this.error.value = errorMsg
          this.connected.value = false
          this.emit('error', errorMsg)

          // Don't reject on STOMP errors if reconnecting
          if (this.reconnectAttempts === 0) {
            reject(new Error(errorMsg))
          }
        },

        onWebSocketError: () => {
          this.connectionPromise = null
          this.addLog('❌ WebSocket Error')
          this.error.value = 'WebSocket error'
          this.connected.value = false
          this.emit('error', 'WebSocket error')
        },

        onWebSocketClose: (event) => {
          this.clearConnectionTimeout()
          this.connectionPromise = null

          // Error code 1006 means abnormal closure
          if (event.code === 1006) {
            this.addLog('🔌 Abnormal closure (1006) - Connection lost unexpectedly')
            this.error.value = 'Connection lost'
          } else {
            this.addLog(`🔌 Closed: ${event.code} - ${event.reason || 'No reason provided'}`)
          }

          this.connected.value = false
          this.emit('disconnected', event)

          // Handle reconnection
          if (
            !this.isManualDisconnect &&
            this.reconnectAttempts < (this.config.maxReconnectAttempts || 10)
          ) {
            this.reconnectAttempts++
            this.addLog(`🔄 Will attempt reconnection in ${this.config.reconnectDelay}ms...`)
          } else if (this.reconnectAttempts >= (this.config.maxReconnectAttempts || 10)) {
            this.addLog('❌ Max reconnection attempts reached')
            this.error.value = 'Max reconnection attempts reached'
          }
        },

        onDisconnect: () => {
          this.clearConnectionTimeout()
          this.connectionPromise = null
          this.addLog('🔌 Disconnected')
          this.connected.value = false
          this.emit('disconnected')
        },
      })

      try {
        this.client.activate()
      } catch (error: any) {
        this.clearConnectionTimeout()
        this.connectionPromise = null
        this.addLog(`❌ Failed to activate client: ${error.message}`)
        this.error.value = error.message
        reject(error)
      }
    })

    return this.connectionPromise
  }

  /**
   * Request pending notifications
   */
  requestPendingNotifications(): void {
    if (this.client && this.client.connected) {
      try {
        this.addLog('📨 Requesting pending/unacknowledged notifications...')
        this.client.publish({
          destination: '/app/connect',
          body: '{}',
        })
      } catch (error: any) {
        this.addLog(`❌ Failed to request pending notifications: ${error.message}`)
      }
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.isManualDisconnect = true
    this.clearConnectionTimeout()
    this.connectionPromise = null

    if (this.client) {
      try {
        // Unsubscribe from all channels
        Array.from(this.subscriptions.keys()).forEach((destination) => {
          this.unsubscribe(destination)
        })

        this.client.deactivate()
        this.addLog('🔌 Disconnecting...')
      } catch (error: any) {
        this.addLog(`❌ Error during disconnect: ${error.message}`)
      }
    }
  }

  /**
   * Send a message to a destination
   */
  publish(destination: string, body: any): boolean {
    if (this.client && this.client.connected) {
      try {
        this.client.publish({
          destination,
          body: typeof body === 'string' ? body : JSON.stringify(body),
        })
        this.addLog(`📤 Published to ${destination}`)
        return true
      } catch (error: any) {
        this.addLog(`❌ Failed to publish: ${error.message}`)
        return false
      }
    }
    this.addLog('⚠ Cannot publish: Not connected')
    return false
  }

  /**
   * Clear all notifications
   */
  clearNotifications(): void {
    this.notifications.value = []
    this.processedNotificationIds.clear()
    this.usesNotificationCountEndpoint = false
    this.notificationCount.value = { read: 0, unread: 0, total: 0 }
    this.unreadCount.value = 0
    this.addLog('🗑 Notifications cleared')
    this.emit('notifications:cleared')
  }

  /**
   * Clear logs
   */
  clearLogs(): void {
    this.logs.value = []
  }

  /**
   * Get notification by ID
   */
  getNotificationById(id: string): EnrichedNotification | undefined {
    return this.notifications.value.find((n) => n.id === id)
  }

  /**
   * Get notifications by type
   */
  getNotificationsByType(type: NotificationType): EnrichedNotification[] {
    return this.notifications.value.filter((n) => n.type === type)
  }

  /**
   * Remove notification by ID
   */
  removeNotification(id: string): void {
    const index = this.notifications.value.findIndex((n) => n.id === id)
    if (index !== -1) {
      const notification = this.notifications.value[index]
      this.notifications.value.splice(index, 1)
      this.processedNotificationIds.delete(id)
      this.updateNotificationCount({
        read: notification.readStatus === 'READ' ? -1 : 0,
        unread: notification.readStatus === 'UNREAD' ? -1 : 0,
        total: -1,
      })
      this.emit('notification:removed', id)
    }
  }

  /**
   * Reset reconnection attempts
   */
  resetReconnectionAttempts(): void {
    this.reconnectAttempts = 0
  }

  /**
   * Get connection status
   */
  getStatus(): {
    connected: boolean
    error: string | null
    reconnectAttempts: number
  } {
    return {
      connected: this.connected.value,
      error: this.error.value,
      reconnectAttempts: this.reconnectAttempts,
    }
  }

  /**
     fetch notifications
     */
  async fetchNotifications(token: string): Promise<void> {
    const [notificationsResult, countResult] = await Promise.allSettled([
      fetch(baseUrl + 'organization/' + 'fetch_notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },

        body: JSON.stringify({
          page: 1,
          per_page: 10,
          with_pagination: 1,
        }),
      }),
      this.fetchNotificationCount(token),
    ])

    if (countResult.status === 'rejected') {
      console.error('Failed to fetch notification count:', countResult.reason)
    }

    if (notificationsResult.status === 'rejected' || !notificationsResult.value.ok) {
      throw new Error('Failed to fetch notifications')
    }
    const data = await notificationsResult.value.json()

    console.log('Notification data:', data.data)
    const notifications = data.data?.items ? data.data.items : []
    this.notifications.value = notifications.map((notification: Notification) => {
      // const type: NotificationType = notification.isBroadcast
      //     ? 'broadcast'
      //     : notification.targetUserId
      //         ? 'direct'
      //         : 'pending'
      return this.normalizeNotification(notification, 'direct')
    })
    this.processedNotificationIds = new Set(
      this.notifications.value.map((notification) => notification.id),
    )
    console.log('Fetched notifications:', this.notifications.value)
    this.recalculateUnreadCount()
    this.emit('notifications:updated', this.notifications.value)
  }

  async fetchNotificationCount(token: string): Promise<void> {
    const res = await fetch(baseUrl + 'organization/' + 'fetch_unread_notification_count', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    })

    if (!res.ok) {
      throw new Error('Failed to fetch notification count')
    }

    const response = await res.json()
    const count = response.data ?? response
    this.applyNotificationCount({
      read: count.count_read,
      unread: count.count_unread,
      total: count.total,
    })
  }
}

// Export singleton instance
export const notificationService = new WebSocketNotificationService()

// Export class for creating multiple instances if needed
export default WebSocketNotificationService
