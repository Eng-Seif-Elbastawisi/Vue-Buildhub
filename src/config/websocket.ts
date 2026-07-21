export const websocketConfig = {
    development: {
        brokerURL: 'ws://socket.techlabeg.com/ws',
        reconnectDelay: 5000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
        debug: true
    },
    production: {
        brokerURL: 'ws://socket.techlabeg.com/ws',
        reconnectDelay: 10000,
        heartbeatIncoming: 20000,
        heartbeatOutgoing: 20000,
        debug: false
    }
}

export const channelConfig = {
    notifications: {
        broadcast: '/topic/notifications',
        direct: '/user/queue/notifications',
        pending: '/user/queue/pending',
        ack: '/user/queue/ack'
    },
    chat: {
        global: '/topic/chat',
        private: '/user/queue/messages'
    },
    updates: {
        system: '/topic/system-updates',
        user: '/user/queue/updates'
    },
    // Add more channels as needed
    custom: {
        alerts: '/topic/custom-alerts',
        analytics: '/topic/analytics'
    }
}