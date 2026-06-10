<script lang="ts" setup>
  /**
   * NoNetworkState Component
   * Displays no network connection error with retry option
   */

  import { ref, onMounted, onUnmounted } from 'vue';

  const props = defineProps<{
    message?: string;
    retryFn?: () => Promise<void>;
  }>();

  const emit = defineEmits<{
    (e: 'retry'): void;
  }>();

  const isRetrying = ref(false);
  const isOnline = ref(navigator.onLine);

  // Listen for online/offline events
  function handleOnline() {
    isOnline.value = true;
  }

  function handleOffline() {
    isOnline.value = false;
  }

  onMounted(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
  });

  onUnmounted(() => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  });

  async function handleRetry() {
    if (isRetrying.value) return;

    isRetrying.value = true;

    try {
      if (props.retryFn) {
        await props.retryFn();
      } else {
        emit('retry');
      }
    } finally {
      isRetrying.value = false;
    }
  }
</script>

<template>
  <div class="no-network-state">
    <div class="no-network-icon">
      <svg
        width="64"
        height="64"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <!-- Wifi icon with X -->
        <path
          d="M1 9L3 11C7.97 6.03 16.03 6.03 21 11L23 9C16.93 2.93 7.08 2.93 1 9Z"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
        <path
          d="M5 13L7 15C9.76 12.24 14.24 12.24 17 15L19 13C15.14 9.14 8.87 9.14 5 13Z"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
        <path
          d="M9 17L12 20L15 17C13.34 15.34 10.66 15.34 9 17Z"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
        <!-- X mark -->
        <line
          x1="4"
          y1="20"
          x2="20"
          y2="4"
          stroke="var(--danger)"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
    </div>

    <h3 class="no-network-title">No Internet Connection</h3>

    <p class="no-network-message">
      {{ message || 'Please check your internet connection and try again.' }}
    </p>

    <div class="connection-status" :class="{ 'is-online': isOnline }">
      <span class="status-dot"></span>
      {{ isOnline ? 'You are back online' : 'Currently offline' }}
    </div>

    <button class="no-network-retry-btn" :disabled="isRetrying || !isOnline" @click="handleRetry">
      <span v-if="isRetrying" class="retry-spinner"></span>
      <span v-else>↻</span>
      {{ isRetrying ? 'Retrying...' : 'Try Again' }}
    </button>
  </div>
</template>

<style scoped>
  .no-network-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    text-align: center;
  }

  .no-network-icon {
    color: var(--gray-500);
    margin-bottom: 1rem;
  }

  .no-network-title {
    margin: 0 0 0.5rem;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--gray-800);
  }

  .no-network-message {
    margin: 0 0 1rem;
    font-size: 0.875rem;
    color: var(--gray-500);
    max-width: 300px;
    line-height: 1.5;
  }

  .connection-status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: var(--danger-light);
    border-radius: 20px;
    font-size: 0.75rem;
    color: var(--danger);
    margin-bottom: 1.5rem;
  }

  .connection-status.is-online {
    background: var(--success-light);
    color: var(--success);
  }

  .status-dot {
    width: 8px;
    height: 8px;
    background: currentColor;
    border-radius: 50%;
    animation: pulse 2s infinite;
  }

  .connection-status.is-online .status-dot {
    animation: none;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }

    50% {
      opacity: 0.5;
    }
  }

  .no-network-retry-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: var(--PrimaryColor);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .no-network-retry-btn:hover:not(:disabled) {
    background: var(--PrimaryColor-hover);
    transform: translateY(-1px);
  }

  .no-network-retry-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .retry-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid currentColor;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (prefers-color-scheme: dark) {
    .no-network-title {
      color: var(--gray-100);
    }

    .no-network-message {
      color: var(--gray-400);
    }

    .connection-status {
      background: var(--gray-900);
    }

    .connection-status.is-online {
      background: var(--success-dark);
    }
  }
</style>
