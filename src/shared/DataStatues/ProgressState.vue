<script lang="ts" setup>
  /**
   * ProgressState Component
   * Displays progress indicator with percentage
   */

  import { computed } from 'vue';

  const props = withDefaults(
    defineProps<{
      progress: number;
      total?: number;
      loaded?: number;
      message?: string;
      showPercentage?: boolean;
      showBytes?: boolean;
      color?: string;
    }>(),
    {
      showPercentage: true,
      showBytes: false,
      color: 'var(--PrimaryColor)',
    },
  );

  // Computed
  const normalizedProgress = computed(() => {
    return Math.min(Math.max(props.progress, 0), 100);
  });

  const displayPercentage = computed(() => {
    return `${Math.round(normalizedProgress.value)}%`;
  });

  const displayBytes = computed(() => {
    if (!props.showBytes || props.loaded === undefined) return '';

    const formatBytes = (bytes: number): string => {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const loaded = formatBytes(props.loaded);
    const total = props.total ? formatBytes(props.total) : '?';

    return `${loaded} / ${total}`;
  });

  const isComplete = computed(() => {
    return normalizedProgress.value >= 100;
  });
</script>

<template>
  <div class="progress-state" :class="{ 'is-complete': isComplete }">
    <!-- Circular Progress (for indeterminate or complete) -->
    <div v-if="isComplete" class="progress-circle">
      <svg width="64" height="64" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="28" fill="none" :stroke="color" stroke-width="4" />
        <path
          d="M20 32 L28 40 L44 24"
          fill="none"
          stroke="white"
          stroke-width="4"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="checkmark"
        />
      </svg>
    </div>

    <!-- Progress Bar -->
    <div v-else class="progress-bar-container">
      <div class="progress-bar">
        <div
          class="progress-fill"
          :style="{ width: `${normalizedProgress}%`, backgroundColor: color }"
        >
          <div class="progress-shine"></div>
        </div>
      </div>

      <div class="progress-info">
        <span v-if="message" class="progress-message">{{ message }}</span>
        <span v-else-if="showBytes && displayBytes" class="progress-bytes">{{ displayBytes }}</span>
        <span v-if="showPercentage" class="progress-percentage">{{ displayPercentage }}</span>
      </div>
    </div>

    <!-- Complete Message -->
    <p v-if="isComplete" class="complete-message">
      {{ message || 'Complete!' }}
    </p>
  </div>
</template>

<style scoped>
  .progress-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    text-align: center;
  }

  /* Circular Progress */
  .progress-circle {
    margin-bottom: 1rem;
  }

  .progress-circle svg {
    filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
  }

  .progress-circle circle {
    transition: stroke 0.3s;
  }

  .checkmark {
    animation: checkmark 0.5s ease forwards;
    stroke-dasharray: 50;
    stroke-dashoffset: 50;
  }

  @keyframes checkmark {
    to {
      stroke-dashoffset: 0;
    }
  }

  /* Progress Bar */
  .progress-bar-container {
    width: 100%;
    max-width: 300px;
  }

  .progress-bar {
    height: 12px;
    background: var(--gray-200);
    border-radius: 6px;
    overflow: hidden;
    position: relative;
  }

  .progress-fill {
    height: 100%;
    border-radius: 6px;
    transition: width 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  .progress-shine {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 50%;
    background: linear-gradient(to bottom, rgba(255, 255, 255, 0.3), transparent);
  }

  /* Progress Info */
  .progress-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 0.75rem;
    font-size: 0.875rem;
  }

  .progress-message,
  .progress-bytes {
    color: var(--gray-500);
  }

  .progress-percentage {
    font-weight: 600;
    color: var(--gray-800);
  }

  /* Complete Message */
  .complete-message {
    margin: 0;
    font-size: 1rem;
    font-weight: 500;
    color: var(--success);
  }

  /* Animations */
  .is-complete .progress-circle {
    animation: bounce 0.5s ease;
  }

  @keyframes bounce {
    0%,
    100% {
      transform: scale(1);
    }

    50% {
      transform: scale(1.1);
    }
  }

  @media (prefers-color-scheme: dark) {
    .progress-bar {
      background: var(--gray-700);
    }

    .progress-percentage {
      color: var(--gray-100);
    }

    .progress-message,
    .progress-bytes {
      color: var(--gray-400);
    }
  }
</style>
