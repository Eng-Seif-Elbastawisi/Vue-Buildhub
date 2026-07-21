import type { StompSubscription } from '@stomp/stompjs'
import type WebSocketNotificationService from '@/services/WebSocketNotificationService'

interface ChannelConfig {
    destination: string
    handler: (data: any, channelType?: string) => void
    type?: string
}

interface ActiveChannel {
    subscription: StompSubscription | null
    handler: (data: any, channelType?: string) => void
    type?: string
}

export class ChannelManager {
    private service: WebSocketNotificationService
    private activeChannels: Map<string, ActiveChannel>

    constructor(notificationService: WebSocketNotificationService) {
        this.service = notificationService
        this.activeChannels = new Map()
    }

    /**
     * Subscribe to multiple channels at once
     */
    subscribeToChannels(channels: ChannelConfig[]): void {
        channels.forEach(({ destination, handler, type }) => {
            const subscription = this.service.subscribe(destination, handler, type)
            this.activeChannels.set(destination, { subscription, handler, type })
        })
    }

    /**
     * Unsubscribe from multiple channels
     */
    unsubscribeFromChannels(destinations: string[]): void {
        destinations.forEach(destination => {
            this.service.unsubscribe(destination)
            this.activeChannels.delete(destination)
        })
    }

    /**
     * Get all active channels
     */
    getActiveChannels(): string[] {
        return Array.from(this.activeChannels.keys())
    }

    /**
     * Subscribe to user-specific channel
     */
    subscribeToUserChannel(userId: string, handler: (data: any, channelType?: string) => void): StompSubscription | null {
        const destination = `/user/${userId}/queue/personal`
        return this.service.subscribe(destination, handler, 'personal')
    }

    /**
     * Subscribe to room/group channel
     */
    subscribeToRoom(roomId: string, handler: (data: any, channelType?: string) => void): StompSubscription | null {
        const destination = `/topic/room/${roomId}`
        return this.service.subscribe(destination, handler, 'room')
    }

    /**
     * Unsubscribe from all channels
     */
    unsubscribeAll(): void {
        this.activeChannels.forEach((_: ActiveChannel, destination: string) => {
            this.service.unsubscribe(destination)
        })
        this.activeChannels.clear()
    }
}