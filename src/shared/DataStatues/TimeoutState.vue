<script lang="ts" setup>
  /**
   * TimeoutState Component
   * Displays timeout error with retry option
   */

  import { ref } from 'vue';

  const props = defineProps<{
    message?: string;
    retryFn?: () => Promise<void>;
  }>();

  const emit = defineEmits<{
    (e: 'retry'): void;
  }>();

  const isRetrying = ref(false);

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
  <div class="timeout-state">
    <div class="timeout-icon">
      <svg
        width="64"
        height="64"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
        <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
    </div>

    <h3 class="timeout-title">Request Timed Out</h3>

    <p class="timeout-message">
      {{
        message ||
        'The server took too long to respond. Please check your connection and try again.'
      }}
    </p>

    <button class="timeout-retry-btn" :disabled="isRetrying" @click="handleRetry">
      <span v-if="isRetrying" class="retry-spinner"></span>
      <span v-else>↻</span>
      {{ isRetrying ? 'Retrying...' : 'Try Again' }}
    </button>
  </div>
</template>

<style scoped>
  .timeout-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    text-align: center;
  }

  .timeout-icon {
    color: var(--warning);
    margin-bottom: 1rem;
  }

  .timeout-title {
    margin: 0 0 0.5rem;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--gray-800);
  }

  .timeout-message {
    margin: 0 0 1.5rem;
    font-size: 0.875rem;
    color: var(--gray-500);
    max-width: 300px;
    line-height: 1.5;
  }

  .timeout-retry-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: var(--warning);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .timeout-retry-btn:hover:not(:disabled) {
    background: var(--warning-dark);
    transform: translateY(-1px);
  }

  .timeout-retry-btn:disabled {
    opacity: 0.7;
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
    .timeout-title {
      color: var(--gray-100);
    }

    .timeout-message {
      color: var(--gray-400);
    }
  }
</style>
