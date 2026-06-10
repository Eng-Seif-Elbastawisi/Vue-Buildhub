<script lang="ts" setup>
  /**
   * ToastContainer Component
   * Displays stackable toast notifications with animations
   */

  import { computed } from 'vue';
  import { dialogManager } from './dialog.manager';
  import { DIALOG_ICONS, DIALOG_COLORS, type Toast } from './dialog.types';

  // Props
  const props = withDefaults(
    defineProps<{
      position?:
        | 'top-right'
        | 'top-left'
        | 'top-center'
        | 'bottom-right'
        | 'bottom-left'
        | 'bottom-center';
      maxToasts?: number;
    }>(),
    {
      position: 'top-right',
      maxToasts: 5,
    },
  );

  // Get toasts from dialog manager
  const toasts = computed(() => {
    const allToasts = dialogManager.toasts.value;
    // Filter by position and limit
    return allToasts
      .filter((t) => (t.position || 'top-right') === props.position)
      .slice(-props.maxToasts);
  });

  // Position classes
  const containerClass = computed(() => {
    const classes = ['toast-container'];

    switch (props.position) {
      case 'top-right':
        classes.push('toast-top-right');
        break;
      case 'top-left':
        classes.push('toast-top-left');
        break;
      case 'top-center':
        classes.push('toast-top-center');
        break;
      case 'bottom-right':
        classes.push('toast-bottom-right');
        break;
      case 'bottom-left':
        classes.push('toast-bottom-left');
        break;
      case 'bottom-center':
        classes.push('toast-bottom-center');
        break;
    }

    return classes;
  });

  // Methods
  function getToastIcon(toast: Toast): string {
    return toast.icon || DIALOG_ICONS[toast.type];
  }

  function getToastColor(toast: Toast): string {
    return DIALOG_COLORS[toast.type];
  }

  function dismissToast(id: string): void {
    dialogManager.dismissToast(id);
  }

  function handleToastClick(toast: Toast): void {
    if (toast.onClick) {
      toast.onClick();
    }
  }
</script>

<template>
  <Teleport to="body">
    <div :class="containerClass">
      <TransitionGroup name="toast-slide">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast"
          :class="[`toast-type-${toast.type}`]"
          @click="handleToastClick(toast)"
        >
          <!-- Icon -->
          <div class="toast-icon" :style="{ backgroundColor: getToastColor(toast) }">
            {{ getToastIcon(toast) }}
          </div>

          <!-- Content -->
          <div class="toast-content">
            <h4 v-if="toast.title" class="toast-title">{{ toast.title }}</h4>
            <p class="toast-message">{{ toast.message }}</p>
          </div>

          <!-- Close Button -->
          <button
            v-if="toast.showClose !== false"
            class="toast-close"
            aria-label="Dismiss toast"
            @click.stop="dismissToast(toast.id)"
          >
            ×
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
  /* Container Positioning */
  .toast-container {
    position: fixed;
    z-index: 10000;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    pointer-events: none;
    max-height: 100vh;
    overflow: hidden;
  }

  .toast-top-right {
    top: 1rem;
    right: 1rem;
    align-items: flex-end;
  }

  .toast-top-left {
    top: 1rem;
    left: 1rem;
    align-items: flex-start;
  }

  .toast-top-center {
    top: 1rem;
    left: 50%;
    transform: translateX(-50%);
    align-items: center;
  }

  .toast-bottom-right {
    bottom: 1rem;
    right: 1rem;
    align-items: flex-end;
    flex-direction: column-reverse;
  }

  .toast-bottom-left {
    bottom: 1rem;
    left: 1rem;
    align-items: flex-start;
    flex-direction: column-reverse;
  }

  .toast-bottom-center {
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
    align-items: center;
    flex-direction: column-reverse;
  }

  /* Toast Item */
  .toast {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    min-width: 300px;
    max-width: 400px;
    padding: 1rem;
    background: var(--bg-main);
    border-radius: 12px;
    box-shadow:
      0 10px 25px -5px rgba(0 0 0 / 10%),
      0 8px 10px -6px rgba(0 0 0 / 10%);
    pointer-events: auto;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .toast:hover {
    box-shadow:
      0 20px 40px -10px rgba(0 0 0 / 15%),
      0 12px 15px -8px rgba(0 0 0 / 10%);
    transform: translateY(-2px);
  }

  /* Toast Icon */
  .toast-icon {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-size: 1rem;
    color: var(--BgWhite);
  }

  /* Toast Content */
  .toast-content {
    flex: 1;
    min-width: 0;
  }

  .toast-title {
    margin: 0 0 0.25rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--gray-800);
  }

  .toast-message {
    margin: 0;
    font-size: 0.875rem;
    color: var(--gray-500);
    line-height: 1.4;
    word-wrap: break-word;
  }

  /* Close Button */
  .toast-close {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    border-radius: 50%;
    font-size: 1.25rem;
    color: var(--gray-400);
    cursor: pointer;
    transition: all 0.2s;
  }

  .toast-close:hover {
    background: var(--gray-100);
    color: var(--gray-600);
  }

  /* Transitions */
  .toast-slide-enter-active {
    transition: all 0.3s ease;
  }

  .toast-slide-leave-active {
    transition: all 0.2s ease;
  }

  .toast-slide-enter-from {
    opacity: 0;
    transform: translateX(100%);
  }

  .toast-slide-leave-to {
    opacity: 0;
    transform: translateX(100%);
  }

  /* Left position animations */
  .toast-top-left .toast-slide-enter-from,
  .toast-bottom-left .toast-slide-enter-from {
    transform: translateX(-100%);
  }

  .toast-top-left .toast-slide-leave-to,
  .toast-bottom-left .toast-slide-leave-to {
    transform: translateX(-100%);
  }

  /* Center position animations */
  .toast-top-center .toast-slide-enter-from,
  .toast-bottom-center .toast-slide-enter-from {
    transform: translateY(-100%);
  }

  .toast-top-center .toast-slide-leave-to,
  .toast-bottom-center .toast-slide-leave-to {
    transform: translateY(-100%);
  }

  /* Type-specific borders */
  .toast-type-success {
    border-bottom: 4px solid var(--success);
  }

  .toast-type-error {
    border-bottom: 4px solid var(--danger);
  }

  .toast-type-warning {
    border-bottom: 4px solid var(--warning);
  }

  .toast-type-info {
    border-bottom: 4px solid var(--info);
  }

  /* Mobile responsive */
  @media (max-width: 480px) {
    .toast-container {
      left: 0.5rem !important;
      right: 0.5rem !important;
      transform: none !important;
    }

    .toast {
      min-width: 0;
      max-width: 100%;
      width: 100%;
    }
  }
</style>
