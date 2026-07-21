// services/PushNotificationService.js

class PushNotificationService {
    constructor() {
        this.registration = null
        this.subscription = null
        this.publicKey = 'BN30cxVcfxLXxplvGFk2y-NJzeH0orQrj4Ahh0bFYwtGc5Jl27aklc30y8xa6vkXyBrwhSA71-Y-1awUI4apiqI'
        this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window
        this.permissionGranted = false
    }

    /**
     * Initialize service worker and check permissions
     */
    async init() {
        if (!this.isSupported) {
            console.warn('Push notifications are not supported in this browser')
            return false
        }

        try {
            // Register service worker
            this.registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/'
            })
            console.log('✅ Service Worker registered:', this.registration)

            // Wait for service worker to be ready
            await navigator.serviceWorker.ready
            console.log('✅ Service Worker ready')

            // Check current permission
            this.permissionGranted = Notification.permission === 'granted'

            return true
        } catch (error) {
            console.error('❌ Service Worker registration failed:', error)
            return false
        }
    }

    /**
     * Request notification permission from user
     */
    async requestPermission() {
        if (!this.isSupported) {
            throw new Error('Push notifications not supported')
        }

        if (Notification.permission === 'granted') {
            this.permissionGranted = true
            return true
        }

        if (Notification.permission === 'denied') {
            throw new Error('Notification permission denied. Please enable in browser settings.')
        }

        const permission = await Notification.requestPermission()
        this.permissionGranted = permission === 'granted'

        if (!this.permissionGranted) {
            throw new Error('Notification permission not granted')
        }

        return true
    }

    /**
     * Convert VAPID public key to Uint8Array
     */
    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4)
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/')

        const rawData = window.atob(base64)
        const outputArray = new Uint8Array(rawData.length)

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i)
        }
        return outputArray
    }

    /**
     * Subscribe user to push notifications
     */
    async subscribe() {
        try {
            // Request permission first
            await this.requestPermission()

            if (!this.registration) {
                throw new Error('Service Worker not registered')
            }

            // Check if already subscribed
            let subscription = await this.registration.pushManager.getSubscription()

            if (subscription) {
                console.log('✅ Already subscribed to push notifications')
                this.subscription = subscription
                return subscription
            }

            // Subscribe to push notifications
            const convertedVapidKey = this.urlBase64ToUint8Array(this.publicKey)

            subscription = await this.registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedVapidKey
            })

            this.subscription = subscription
            console.log('✅ Subscribed to push notifications:', subscription)

            return subscription
        } catch (error) {
            console.error('❌ Failed to subscribe:', error)
            throw error
        }
    }

    /**
     * Unsubscribe from push notifications
     */
    async unsubscribe() {
        try {
            if (!this.subscription) {
                const subscription = await this.registration?.pushManager.getSubscription()
                this.subscription = subscription
            }

            if (this.subscription) {
                await this.subscription.unsubscribe()
                this.subscription = null
                console.log('✅ Unsubscribed from push notifications')
                return true
            }

            return false
        } catch (error) {
            console.error('❌ Failed to unsubscribe:', error)
            throw error
        }
    }

    /**
     * Get current subscription
     */
    async getSubscription() {
        if (!this.registration) {
            return null
        }

        try {
            const subscription = await this.registration.pushManager.getSubscription()
            this.subscription = subscription
            return subscription
        } catch (error) {
            console.error('❌ Failed to get subscription:', error)
            return null
        }
    }

    /**
     * Send subscription to backend
     */
    async sendSubscriptionToBackend(subscription, userId, token) {
        try {
            const response = await fetch('http://socket.techlabeg.com/api/push/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    subscription: subscription.toJSON(),
                    userId: userId
                })
            })

            if (!response.ok) {
                throw new Error('Failed to send subscription to backend')
            }

            console.log('✅ Subscription sent to backend')
            return await response.json()
        } catch (error) {
            console.error('❌ Failed to send subscription to backend:', error)
            throw error
        }
    }

    /**
     * Remove subscription from backend
     */
    async removeSubscriptionFromBackend(token) {
        try {
            const subscription = await this.getSubscription()
            if (!subscription) {
                return
            }

            const response = await fetch('http://socket.techlabeg.com/api/push/unsubscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    endpoint: subscription.endpoint
                })
            })

            if (!response.ok) {
                throw new Error('Failed to remove subscription from backend')
            }

            console.log('✅ Subscription removed from backend')
        } catch (error) {
            console.error('❌ Failed to remove subscription from backend:', error)
            throw error
        }
    }

    /**
     * Complete setup: init, subscribe, and send to backend
     */
    async setupPushNotifications(userId, token) {
        try {
            // Initialize service worker
            const initialized = await this.init()
            if (!initialized) {
                throw new Error('Failed to initialize service worker')
            }

            // Subscribe to push notifications
            const subscription = await this.subscribe()

            // Send subscription to backend
            await this.sendSubscriptionToBackend(subscription, userId, token)

            console.log('✅ Push notifications fully configured')
            return subscription
        } catch (error) {
            console.error('❌ Push notification setup failed:', error)
            throw error
        }
    }

    /**
     * Check if notifications are enabled
     */
    isEnabled() {
        return this.permissionGranted && this.subscription !== null
    }

    /**
     * Get permission status
     */
    getPermissionStatus() {
        return Notification.permission
    }
}

// Export singleton
export const pushNotificationService = new PushNotificationService()
export default PushNotificationService