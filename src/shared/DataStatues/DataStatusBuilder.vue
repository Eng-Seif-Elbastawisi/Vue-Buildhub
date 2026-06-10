<script lang="ts" setup>
  /**
   * DataStatusBuilder Component
   * Enhanced component handling all data states with customizable slots
   */

  import {
    DataDump,
    DataEmpty,
    DataFailed,
    DataInitial,
    DataLoading,
    type DataState,
    DataSuccess,
    DataValid,
    DataTimeout,
    DataNoNetwork,
    DataCancelled,
    DataProgress,
    DataRateLimited,
  } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import { computed, type PropType } from 'vue';

  // Import state components
  // import DataFailedState from './DataFailed.vue';
  import TimeoutState from './TimeoutState.vue';
  // import NoNetworkState from './NoNetworkState.vue';
  import ProgressState from './ProgressState.vue';

  const props = defineProps({
    /**
     * @deprecated Use 'controller' instead
     */
    status: {
      type: Object as PropType<DataState<any>>,
      default: undefined,
    },
    /**
     * The current data state from controller
     */
    controller: {
      type: Object as PropType<DataState<any>>,
      default: () => new DataInitial<any>(),
    },
    /**
     * Show skeleton loader instead of spinner
     */
    useSkeleton: {
      type: Boolean,
      default: false,
    },
    /**
     * Custom retry function for error states
     */
    onRetry: {
      type: Function as PropType<() => Promise<void>>,
      default: undefined,
    },
    /**
     * Show inline error instead of full-page
     */
    inlineError: {
      type: Boolean,
      default: false,
    },
  });

  const emit = defineEmits<{
    (e: 'retry'): void;
  }>();

  // Use controller prop, fallback to status for backwards compatibility
  const currentState = computed(() => props.controller ?? props.status ?? new DataInitial());

  // State type checks
  const isSuccess = computed(
    () => currentState.value instanceof DataSuccess || currentState.value instanceof DataDump,
  );

  const isValid = computed(() => currentState.value instanceof DataValid);

  const isEmpty = computed(() => currentState.value instanceof DataEmpty);

  const isInitial = computed(() => currentState.value instanceof DataInitial);

  const isFailed = computed(() => currentState.value instanceof DataFailed);

  const isLoading = computed(() => currentState.value instanceof DataLoading);

  const isTimeout = computed(() => currentState.value instanceof DataTimeout);

  const isNoNetwork = computed(() => currentState.value instanceof DataNoNetwork);

  const isCancelled = computed(() => currentState.value instanceof DataCancelled);

  const isProgress = computed(() => currentState.value instanceof DataProgress);

  const isRateLimited = computed(() => currentState.value instanceof DataRateLimited);

  // Error state (any error condition)
  // const isError = computed(
  //   () => isFailed.value || isTimeout.value || isNoNetwork.value || isRateLimited.value,
  // );

  // Get retry function from state or props
  const retryFn = computed(() => {
    if (props.onRetry) return props.onRetry;

    const state = currentState.value;
    if (state instanceof DataTimeout && state.retryFn) {
      return async () => {
        await state.retryFn!();
      };
    }
    if (state instanceof DataNoNetwork && state.retryFn) {
      return async () => {
        await state.retryFn!();
      };
    }
    if (state instanceof DataRateLimited && state.retryFn) {
      return async () => {
        await state.retryAfterDelay();
      };
    }

    return undefined;
  });

  // Handle retry
  function handleRetry() {
    if (retryFn.value) {
      retryFn.value();
    } else {
      emit('retry');
    }
  }

  // Get progress value for progress state
  const progressValue = computed(() => {
    if (currentState.value instanceof DataProgress) {
      return currentState.value.progress;
    }
    return 0;
  });

  // Get error message
  // const errorMessage = computed(() => {
  //   const state = currentState.value;
  //   if (state.error) {
  //     return state.error.displayMessage || state.error.title;
  //   }
  //   return 'An error occurred';
  // });
</script>

<template>
  <div class="data-status-builder">
    <!-- Success State -->
    <div v-if="isSuccess" class="status-success">
      <slot name="success" :data="currentState.data" :state="currentState">
        <!-- Default: render nothing (let parent handle) -->
      </slot>
    </div>

    <!-- Valid State -->
    <div v-else-if="isValid" class="status-valid">
      <slot name="valid" :validation="currentState.validation" :state="currentState">
        <!-- Default: render nothing -->
      </slot>
    </div>

    <!-- Empty State -->
    <div v-else-if="isEmpty" class="status-empty">
      <slot name="empty" :state="currentState">
        <div class="empty-default">
          <div class="empty-icon">📭</div>
          <p class="empty-message">No data available</p>
        </div>
      </slot>
    </div>

    <!-- Initial State -->
    <div v-else-if="isInitial" class="status-initial">
      <slot name="initial" :data="currentState.data" :state="currentState">
        <!-- Default: render nothing (waiting for first load) -->
      </slot>
    </div>

    <!-- Progress State -->
    <div v-else-if="isProgress" class="status-progress">
      <slot
        name="progress"
        :progress="progressValue"
        :total="(currentState as any).total"
        :loaded="(currentState as any).loaded"
        :state="currentState"
      >
        <ProgressState
          :progress="progressValue"
          :total="(currentState as any).total"
          :loaded="(currentState as any).loaded"
        />
      </slot>
    </div>

    <!-- Timeout State -->
    <div v-else-if="isTimeout" class="status-timeout">
      <slot name="timeout" :retry="handleRetry" :state="currentState">
        <TimeoutState :retry-fn="retryFn" @retry="handleRetry" />
      </slot>
    </div>

    <!-- No Network State -->
    <div v-else-if="isNoNetwork" class="status-no-network">
      <slot name="no-network" :retry="handleRetry" :state="currentState">
        <!-- <NoNetworkState :retry-fn="retryFn" @retry="handleRetry" /> -->
      </slot>
    </div>

    <!-- Rate Limited State -->
    <div v-else-if="isRateLimited" class="status-rate-limited">
      <slot
        name="rate-limited"
        :retry="handleRetry"
        :retry-after="(currentState as any).retryAfter"
        :state="currentState"
      >
        <div class="rate-limited-default">
          <div class="rate-limited-icon">⏱️</div>
          <h3>Too Many Requests</h3>
          <p>Please wait before trying again.</p>
          <button class="retry-btn" @click="handleRetry">Try Again</button>
        </div>
      </slot>
    </div>

    <!-- Cancelled State -->
    <div v-else-if="isCancelled" class="status-cancelled">
      <slot name="cancelled" :state="currentState">
        <div class="cancelled-default">
          <div class="cancelled-icon">🚫</div>
          <p>Request was cancelled</p>
        </div>
      </slot>
    </div>

    <!-- Failed State -->
    <div v-else-if="isFailed" class="status-failed">
      <slot name="failed" :error="currentState.error" :retry="handleRetry" :state="currentState">
        <!-- <div v-if="inlineError" class="inline-error">
          <span class="error-icon">⚠️</span>
          <span class="error-text">{{ errorMessage }}</span>
          <button v-if="retryFn || $attrs.onRetry" class="inline-retry" @click="handleRetry">
            Retry
          </button>
        </div>
        <DataFailedState v-else /> -->
      </slot>
    </div>

    <!-- Loading State -->
    <div v-else-if="isLoading" class="status-loading">
      <slot name="loader" :state="currentState">
        <div v-if="useSkeleton" class="skeleton-loader">
          <div class="skeleton-line"></div>
          <div class="skeleton-line short"></div>
          <div class="skeleton-line"></div>
        </div>
        <div v-else class="spinner-loader">
          <div class="spinner"></div>
          <span class="loading-text">Loading...</span>
        </div>
      </slot>
    </div>

    <!-- Unknown/Default State -->
    <div v-else class="status-unknown">
      <slot name="default" :state="currentState">
        <!-- Render nothing for unknown states -->
      </slot>
    </div>
  </div>
</template>

<style scoped>
  .data-status-builder {
    width: 100%;
  }

  /* Empty State */
  .empty-default {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    text-align: center;
  }

  .empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .empty-message {
    color: var(--gray-500);
    font-size: 1rem;
  }

  /* Loading */
  .spinner-loader {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    gap: 1rem;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--gray-200);
    border-top-color: var(--PrimaryColor);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .loading-text {
    color: var(--gray-500);
    font-size: 0.875rem;
  }

  /* Skeleton Loader */
  .skeleton-loader {
    padding: 1rem;
  }

  .skeleton-line {
    height: 1rem;
    background: linear-gradient(
      90deg,
      var(--gray-200) 25%,
      var(--gray-100) 50%,
      var(--gray-200) 75%
    );
    background-size: 200% 100%;
    border-radius: 4px;
    margin-bottom: 0.75rem;
    animation: shimmer 1.5s infinite;
  }

  .skeleton-line.short {
    width: 60%;
  }

  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }

    100% {
      background-position: -200% 0;
    }
  }

  /* Inline Error */
  .inline-error {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: var(--danger-light);
    border: 1px solid var(--danger-light);
    border-radius: 8px;
    font-size: 0.875rem;
  }

  .error-icon {
    flex-shrink: 0;
  }

  .error-text {
    flex: 1;
    color: var(--danger);
  }

  .inline-retry {
    padding: 0.25rem 0.75rem;
    background: var(--danger);
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 0.75rem;
    cursor: pointer;
    transition: background 0.2s;
  }

  .inline-retry:hover {
    background: var(--danger-dark);
  }

  /* Rate Limited */
  .rate-limited-default {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem;
    text-align: center;
  }

  .rate-limited-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .rate-limited-default h3 {
    margin: 0 0 0.5rem;
    color: var(--gray-800);
  }

  .rate-limited-default p {
    margin: 0 0 1.5rem;
    color: var(--gray-500);
  }

  .retry-btn {
    padding: 0.75rem 1.5rem;
    background: var(--PrimaryColor);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.2s;
  }

  .retry-btn:hover {
    background: var(--PrimaryColor-hover);
  }

  /* Cancelled */
  .cancelled-default {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem;
    text-align: center;
    color: var(--gray-500);
  }

  .cancelled-icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    .empty-message,
    .loading-text {
      color: var(--gray-400);
    }

    .skeleton-line {
      background: linear-gradient(
        90deg,
        var(--gray-700) 25%,
        var(--gray-600) 50%,
        var(--gray-700) 75%
      );
      background-size: 200% 100%;
    }

    .inline-error {
      background: var(--gray-900);
      border-color: var(--danger-dark);
    }

    .error-text {
      color: var(--danger-light);
    }

    .rate-limited-default h3 {
      color: var(--gray-100);
    }

    .rate-limited-default p,
    .cancelled-default {
      color: var(--gray-400);
    }
  }
</style>
