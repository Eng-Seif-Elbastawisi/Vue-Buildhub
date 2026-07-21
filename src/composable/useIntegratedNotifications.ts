import { ref, computed, onMounted, onUnmounted } from 'vue'

import { ChannelManager } from '@/utils/ChannelManager'
import { channelConfig, websocketConfig } from '@/config/websocket'
import { notificationService, type EnrichedNotification } from '@/services/WebSocketNotificationService'
import { pushNotificationService } from '@/services/PushNotificationService'
export interface UseIntegratedNotificationsOptions {
  autoConnect?: boolean
  token?: string | null
  userId?: string | number | null
  brokerURL?: string
  enablePushNotifications?: boolean
  acknowledgeNotification?: (id: string) => void
  onNotification?: ((notification: EnrichedNotification) => void) | null
  onChatMessage?: ((message: any) => void) | null
  NOTIFICATION_SOUND_BASE64?: string
  fetchNotifications?: boolean
  userToken?: string | null
  enableChat?: boolean
}
export function useIntegratedNotifications(options: UseIntegratedNotificationsOptions = {}) {
  const isProduction = import.meta.env.PROD
  const config = isProduction ? websocketConfig.production : websocketConfig.development
  const {
    autoConnect = true,
    token = null,
    userId = null,
    brokerURL = config.brokerURL,
    enablePushNotifications = true,
    userToken = null,
    onNotification = null,
    NOTIFICATION_SOUND_BASE64 = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIF2W56+mmUBELTKXh8bllHAU2jdXvyn0tBSh+zPLaizsKGGS46Om1XBoFM4nU8c1+LgYngM3y3I4+ChlluOvpplARC0ul4fG5ZRwFNo3V78p9LQUofszy2os7ChhluevrpVERC0yn4fG3ZBwFOI7U8ct+LQUoftDy24k7ChZluujoplARDEul4e+3ZRwGOY/V8Mp/LgYpf9Dy3Ik7CxZluejpplARDEym4fG3ZBwFOI/V8cp+LQYoftDy24o7ChZmuejpplARDEym4fG3YxwFOI/V8Ml/LgYof9Dy3Io7ChZmuujqplARDEym4fG3YxwFOI/V8Ml/LgYof9Dy3Io7ChZmuejpplARDEym4fG3YxwFOI/V8Ml/LgYof9Dy3Io7ChZmuejpplARDEym4fG3YxwFOI/V8Ml/LgYof9Dy3Io7ChZmuejpplARDEym4fG3YxwFOI/V8Ml/LgYof9Dy3Io7ChZmuejpplARDEym4fG3YxwFOI/V8Ml/LgYof9Dy3Io7ChZmuejpplARDEym4fG3YxwFOI/V8Ml/LgYof9Dy3Io7ChZmuejpplARDEym4fG3YxwFOI/V8Ml/LgYof9Dy3Io7ChZmuejpplARDEym4fG3YxwFOI/V8Ml/LgYof9Dy3Io7ChZmuejpplARDEym4fG3YxwFOI/V8Ml/LgYof9Dy3Io7ChZmuejpplARDEym4fG3YxwFOI/V8Ml/LgYof9Dy3Io7ChZmuejpplARDEym4fG3YxwFOI/V8Ml/LgYof9Dy3Io7ChZmuejpplARDEym4fG3YxwFOI/V8Ml/LgYof9Dy3Io7ChZmuejpplARDEym4fG3YxwFOI/V8Ml/LgYof9Dy3Io7ChZmuejpplARDEym4fG3YxwFOI/V8Ml/LgYof9Dy3Io7ChZmuejpplARDEym4fG3YxwFOI/V8Ml/',
    fetchNotifications = false,
    enableChat = false,
    onChatMessage = null,
  } = options
  // State
  const wsConnected = computed(() => notificationService.connected.value)
  const wsError = computed(() => notificationService.error.value)
  const notifications = computed(() => notificationService.notifications.value)
  const logs = computed(() => notificationService.logs.value)
  const pushEnabled = ref(false)
  const pushPermission = ref(Notification.permission)
  const pushSubscription = ref(null)
  const setupInProgress = ref(false)
  const channelManager = new ChannelManager(notificationService)
  // Computed
  const fullyConnected = computed(() => wsConnected.value && pushEnabled.value)
  const unreadCount = computed(() => notificationService.unreadCount.value)
  if (fetchNotifications) {
    notificationService.fetchNotifications(userToken!)
  }
  /**
   * Setup WebSocket connection
   */
  /**
   * Setup WebSocket connection
   */
  const setupWebSocket = async (authToken: string | null | undefined): Promise<boolean> => {
    console.log(authToken, 'setupWebSocket called with token')
    if (!authToken) return false
    try {
      notificationService.configure({ brokerURL })
      await notificationService.connect(authToken)
      // Setup channels after connection
      setupChannels()
      console.log('✅ WebSocket connected')
      return true
    } catch (error) {
      console.error('❌ WebSocket connection failed:', error)
      return false
    }
  }
  const setupChannels = () => {
    const channels = []
    // Notifications channels
    channels.push(
      {
        destination: channelConfig.notifications.broadcast,
        handler: (d: any) => notificationService.handleNotification(d, 'broadcast'),
        type: 'broadcast',
      },
      {
        destination: channelConfig.notifications.direct,
        handler: (d: any) => notificationService.handleNotification(d, 'direct'),
        type: 'direct',
      },
      {
        destination: channelConfig.notifications.pending,
        handler: (d: any) => {
          if (Array.isArray(d)) {
            d.forEach((notification) => {
              const type: any = notification.isBroadcast
                ? 'broadcast'
                : notification.targetUserId
                  ? 'direct'
                  : 'pending'
              notificationService.handleNotification(notification, type)
            })
          }
        },
        type: 'pending',
      },
      {
        destination: channelConfig.notifications.ack,
        handler: (d: any) => notificationService.emit('ack:confirmed', d),
        type: 'ack',
      },
    )
    // Chat channels if enabled
    if (enableChat) {
      channels.push(
        { destination: channelConfig.chat.global, handler: handleChatMessage, type: 'chat-global' },
        {
          destination: channelConfig.chat.private,
          handler: handleChatMessage,
          type: 'chat-private',
        },
      )
    }
    channelManager.subscribeToChannels(channels)
  }
  const handleChatMessage = (data: any) => {
    console.log('💬 New Chat Message:', data)
    if (onChatMessage) {
      onChatMessage(data)
    }
    window.dispatchEvent(new CustomEvent('chat-message', { detail: data }))
  }
  /**
   * Setup Push Notifications
   */
  const setupPushNotifications = async (
    userId: string | number | null | undefined,
    token: string | null | undefined,
  ) => {
    if (!userId || !token) return
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') throw new Error('Permission denied')
    const res = await fetch('/api/push/vapid-public-key')
    const { data } = await res.json()
    const registration = await navigator.serviceWorker.register('/sw.js')
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: pushNotificationService.urlBase64ToUint8Array(data.publicKey),
    })
    const p256dhKey = subscription.getKey('p256dh')
    const authKey = subscription.getKey('auth')
    if (!p256dhKey || !authKey) {
      throw new Error('Push subscription keys missing')
    }
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId,
        endpoint: subscription.endpoint,
        p256dh: btoa(String.fromCharCode(...new Uint8Array(p256dhKey))),
        auth: btoa(String.fromCharCode(...new Uint8Array(authKey))),
      }),
    })
    return subscription
  }
  /**
   * Complete setup: WebSocket + Push Notifications
   */
  const setupNotifications = async (
    authToken: string | null | undefined,
    userIdentifier: string | number | null | undefined,
  ) => {
    // console.warn('❌ Cannot setup notifications: missing token or userId')
    if (!authToken || !userIdentifier) {
      console.warn('❌ Cannot setup notifications: missing token or userId')
      return { wsSuccess: false, pushSuccess: false }
    }
    try {
      setupInProgress.value = true
      // Setup WebSocket
      const wsSuccess = await setupWebSocket(authToken)
      // Setup Push Notifications
      let pushSuccess = false
      if (enablePushNotifications) {
        const sub = await setupPushNotifications(userIdentifier, authToken)
        pushSuccess = !!sub
      }
      if (wsSuccess) {
        console.log('✅ Notifications fully configured')
        console.log(`   - WebSocket: ${wsSuccess ? '✓' : '✗'}`)
        console.log(`   - Push: ${pushSuccess ? '✓' : '✗'}`)
      }
      return { wsSuccess, pushSuccess }
    } catch (error) {
      console.error('❌ Notification setup failed:', error)
      return { wsSuccess: false, pushSuccess: false }
    } finally {
      setupInProgress.value = false
    }
  }
  /**
   * Request push notification permission
   */
  const requestPushPermission = async () => {
    try {
      await pushNotificationService.requestPermission()
      pushPermission.value = Notification.permission
      if (pushPermission.value === 'granted' && token && userId) {
        await setupPushNotifications(userId, token)
      }
      return pushPermission.value === 'granted'
    } catch (error) {
      console.error('❌ Permission request failed:', error)
      return false
    }
  }
  /**
   * Disable push notifications
   */
  const disablePushNotifications = async () => {
    try {
      if (token) {
        await pushNotificationService.removeSubscriptionFromBackend(token)
      }
      await pushNotificationService.unsubscribe()
      pushEnabled.value = false
      pushSubscription.value = null
      console.log('✅ Push notifications disabled')
      return true
    } catch (error) {
      console.error('❌ Failed to disable push notifications:', error)
      return false
    }
  }
  const acknowledgeNotification = (id: string) => {
    notificationService.acknowledgeNotification(id)
  }
  /**
   * Listen for notification clicks from service worker
   */
  const listenForNotificationClicks = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'NOTIFICATION_CLICKED') {
          console.log('Notification clicked in background:', event.data.data)
          // Handle the notification data
          const notificationData = event.data.data
          // Emit custom event or call callback
          if (onNotification) {
            onNotification(notificationData)
          }
          // You can also emit a custom event for components to listen to
          window.dispatchEvent(
            new CustomEvent('notification-clicked', {
              detail: notificationData,
            }),
          )
        }
      })
    }
  }
  /**
   * Setup WebSocket event handlers
   */
  const setupWebSocketHandlers = () => {
    // Handle new notifications
    notificationService.on('notification', (notification) => {
      console.log('📬 New notification via WebSocket:', notification)
      // Call user's callback for in-app handling (toasts, etc.)
      if (onNotification) {
        onNotification(notification)
      }
      // IMPORTANT: Show native browser notification if app is in background/hidden
      // This is DIFFERENT from app toasts - browser handles this
      if (document.hidden && Notification.permission === 'granted') {
        showNativeBrowserNotification(notification)
      }
    })
    // Connection status
    notificationService.on('connected', () => {
      console.log('✅ WebSocket connected')
    })
    notificationService.on('disconnected', () => {
      console.log('🔌 WebSocket disconnected')
    })
    notificationService.on('error', (error) => {
      console.error('❌ WebSocket error:', error)
    })
  }
  /**
   * When app is completely closed, Service Worker handles notifications via Push API
   */
  const showNativeBrowserNotification = (notification: EnrichedNotification) => {
    if (Notification.permission !== 'granted') {
      return
    }
    const audio = new Audio(NOTIFICATION_SOUND_BASE64)
    audio.play()
    // Create native browser notification using Notification API
    const notif = new Notification(notification.title || 'New Notification', {
      body: JSON.parse(notification?.body!)?.message || notification.body,
      icon: notification.icon || '/logo.ico',
      badge: '/logo.ico',
      tag: notification.id,
      vibrate: [200, 100, 200],
      requireInteraction: false,
      data: notification,
    } as NotificationOptions)
    // Handle click - bring app back to foreground
    notif.onclick = () => {
      window.focus()
      notif.close()
      const parsedBody =
        typeof notification.body === 'string' ? JSON.parse(notification.body) : notification.body
      const typeId = parsedBody?.data?.type_id || notification.data?.type_id
      if (typeId) {
        window.location.href = `/daily-work/${typeId}`
      } else if (notification.url) {
        window.location.href = notification.url
      }
    }
  }
  /**
   * Disconnect everything
   */
  const disconnect = async () => {
    channelManager.unsubscribeAll()
    notificationService.disconnect()
    console.log('🔌 Disconnected from notifications')
  }
  // Methods from WebSocket service
  const subscribe = (
    destination: string,
    handler: (data: any, channelType?: string) => void,
    channelType?: string,
  ) => {
    return notificationService.subscribe(destination, handler, channelType)
  }
  const unsubscribe = (destination: string) => {
    notificationService.unsubscribe(destination)
  }
  const clearNotifications = () => {
    notificationService.clearNotifications()
  }
  const removeNotification = (id: string | undefined) => {
    if (id) {
      notificationService.removeNotification(id)
    }
  }
  // Lifecycle
  onMounted(async () => {
    // Setup WebSocket handlers
    setupWebSocketHandlers()
    // Listen for notification clicks
    listenForNotificationClicks()
    // Auto-connect if enabled
    // console.log('useIntegratedNotifications mounted with options:', { autoConnect, token, userId })
    if (autoConnect && token && userId) {
      await setupNotifications(token, userId)
    }
  })
  onUnmounted(() => {
    // Don't disconnect - keep connections alive across components
    // But maybe we want to unsubscribe if this component was the only one?
    // For now, consistent with original behavior, we don't auto-disconnect
  })
  return {
    // State
    wsConnected,
    wsError,
    notifications,
    logs,
    pushEnabled,
    pushPermission,
    pushSubscription,
    fullyConnected,
    unreadCount,
    setupInProgress,
    // Methods
    setupNotifications,
    setupWebSocket,
    setupPushNotifications,
    requestPushPermission,
    disablePushNotifications,
    disconnect,
    subscribe,
    unsubscribe,
    clearNotifications,
    removeNotification,
    acknowledgeNotification,
    // Services
    wsService: notificationService,
    pushService: pushNotificationService,
    channelManager,
  }
}
