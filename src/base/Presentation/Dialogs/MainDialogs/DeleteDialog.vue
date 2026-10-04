<script lang="ts" setup>
  import { computed, inject, onUnmounted, ref } from 'vue';
  import Dialog from 'primevue/dialog';
  import { useI18n } from 'vue-i18n';
  import { DataFailed } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import {
    beginDeleteConfirmation,
    deleteSuccessMotionDuration,
    DELETE_OUTCOME_EVENT,
    type DeleteOutcome,
  } from '@/base/Presentation/Controller/dataMutationEvent';

  type DeletePhase = 'confirm' | 'loading' | 'success' | 'error';

  const { t } = useI18n();
  const visible = ref(false);
  const phase = ref<DeletePhase>('confirm');
  const pending = ref(false);
  const backendError = ref('');
  const isBusy = computed(() => pending.value || phase.value === 'success');
  const trigger = ref<HTMLElement | null>(null);
  let closeTimer: ReturnType<typeof setTimeout> | undefined;
  let outcomeListener: ((event: Event) => void) | undefined;
  let releaseDeleteConfirmation: (() => void) | undefined;
  const armDestructiveRemoval = inject<(element: HTMLElement | null) => void>(
    'dashboard-destructive-motion',
    () => undefined,
  );

  const openDialog = () => {
    phase.value = 'confirm';
    backendError.value = '';
    visible.value = true;
  };

  const finishDelete = (outcome: DeleteOutcome) => {
    if (outcome.status === 'error') {
      backendError.value = outcome.errorMessage || t('error.unexpected');
      phase.value = 'error';
      return;
    }

    phase.value = 'success';
    closeTimer = setTimeout(() => {
      visible.value = false;
    }, deleteSuccessMotionDuration());
  };

  const confirmDelete = async () => {
    if (disabled || isBusy.value) return;

    phase.value = 'loading';
    pending.value = true;
    backendError.value = '';
    armDestructiveRemoval(trigger.value);
    releaseDeleteConfirmation = beginDeleteConfirmation();
    let controllerOutcome: DeleteOutcome | undefined;
    outcomeListener = (event) => {
      if (!controllerOutcome) {
        controllerOutcome = (event as CustomEvent<DeleteOutcome>).detail;
        finishDelete(controllerOutcome);
      }
      event.preventDefault();
    };
    window.addEventListener(DELETE_OUTCOME_EVENT, outcomeListener);

    try {
      const result = await onDelete?.();
      if (!controllerOutcome) {
        finishDelete(
          result instanceof DataFailed
            ? { status: 'error', errorMessage: result.error?.displayMessage }
            : { status: 'success' },
        );
      }
    } catch (error) {
      if (!controllerOutcome) {
        finishDelete({
          status: 'error',
          errorMessage: error instanceof Error ? error.message : undefined,
        });
      }
    } finally {
      pending.value = false;
      window.removeEventListener(DELETE_OUTCOME_EVENT, outcomeListener);
      outcomeListener = undefined;
      releaseDeleteConfirmation?.();
      releaseDeleteConfirmation = undefined;
    }
  };

  onUnmounted(() => {
    if (closeTimer) clearTimeout(closeTimer);
    if (outcomeListener) window.removeEventListener(DELETE_OUTCOME_EVENT, outcomeListener);
    releaseDeleteConfirmation?.();
  });

  const {
    title = 'delete',
    message = 'delete_message',
    hasbtn,
    triggerLabel,
    triggerClass,
    disabled = false,
    onDelete,
  } = defineProps<{
    title?: string;
    message?: string;
    hasbtn?: boolean;
    triggerLabel?: string;
    triggerClass?: string;
    disabled?: boolean;
    onDelete?: () => unknown;
  }>();
</script>

<template>
  <button v-if="hasbtn" ref="trigger" :disabled="disabled" @click="openDialog">
    <slot name="btn"> </slot>
  </button>
  <button v-else ref="trigger" :class="triggerClass" :disabled="disabled" @click="openDialog">
    {{ triggerLabel ?? $t('Delete') }}
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M14.25 5.25L13.5995 14.3569C13.5434 15.1418 12.8903 15.75 12.1033 15.75H5.89668C5.10972 15.75 4.45656 15.1418 4.40049 14.3569L3.75 5.25M7.5 8.25V12.75M10.5 8.25V12.75M11.25 5.25V3C11.25 2.58579 10.9142 2.25 10.5 2.25H7.5C7.08579 2.25 6.75 2.58579 6.75 3V5.25M3 5.25H15"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </button>
  <Dialog
    v-model:visible="visible"
    :modal="true"
    :close-on-escape="!isBusy"
    :dismissable-mask="!isBusy"
    :pt="{
      root: 'delete-dialog dashboard-destructive-dialog',
      header: 'dialog-header',
      content: 'dialog-body',
    }"
    :style="{ width: 'min(35rem, calc(100vw - 2rem))' }"
  >
    <template #container>
      <span
        class="dashboard-destructive-dialog__mark"
        :class="`dashboard-destructive-dialog__mark--${phase}`"
        aria-hidden="true"
      >
        <svg viewBox="4 3 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M13 9h22M25 9v12"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          />
          <g class="delete-scene__lift">
            <path
              d="M25 20v4c0 2-1.5 3-3 3"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
            />
            <rect
              x="12"
              y="27"
              width="25"
              height="14"
              rx="2"
              fill="var(--danger-light)"
              stroke="currentColor"
              stroke-width="1.7"
            />
            <path d="M12 34h25M20 27v7m9 0v7" stroke="currentColor" stroke-width="1.3" />
          </g>
          <g class="delete-scene__warning">
            <circle cx="37" cy="14" r="7" fill="var(--danger)" />
            <path
              d="M37 10.5v4m0 2v.2"
              stroke="var(--white)"
              stroke-width="1.8"
              stroke-linecap="round"
            />
          </g>
          <g class="delete-scene__check">
            <circle cx="37" cy="14" r="7" fill="var(--success)" />
            <path
              d="m33.5 14 2.4 2.3 4.5-4.8"
              stroke="var(--white)"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </g>
        </svg>
      </span>

      <h4 class="dialog-title">{{ title }}</h4>
      <p class="dialog-message" :aria-live="phase === 'error' ? 'assertive' : 'off'">
        {{ phase === 'error' ? backendError : message }}
      </p>
      <div class="flex gap-2 items-center btns">
        <button class="btn btn-delete-danger" :disabled="disabled || isBusy" @click="confirmDelete">
          {{ $t('yes_delete_it') }}
        </button>
        <button class="btn btn-third" :disabled="isBusy" @click="visible = false">
          {{ $t('cancel') }}
        </button>
      </div>
    </template>
  </Dialog>
</template>

<style lang="scss">
  .delete-dialog.p-dialog-enter-active {
    transition:
      opacity 230ms ease-out,
      transform 230ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .delete-dialog.p-dialog-enter-from {
    opacity: 0;
    transform: scale(0.96);
  }

  .dashboard-destructive-dialog .dashboard-destructive-dialog__mark {
    display: grid;
    width: clamp(120px, 28vw, 144px);
    aspect-ratio: 1;
    place-items: center;
    margin: 0 auto 20px;
    border: 1px solid var(--danger-light, var(--quote-line));
    border-radius: 12px;
    color: var(--danger-dark, var(--quote-ink));
    background: color-mix(
      in sRGB,
      var(--danger-light, var(--white)) 55%,
      var(--quote-paper, var(--white))
    );
  }

  .dashboard-destructive-dialog .dashboard-destructive-dialog__mark svg {
    width: 78%;
    height: 78%;
    max-height: none;
    overflow: visible;
  }

  .dashboard-destructive-dialog .delete-scene__lift,
  .dashboard-destructive-dialog .delete-scene__warning,
  .dashboard-destructive-dialog .delete-scene__check {
    transform-box: fill-box;
    transform-origin: center;
  }

  .dashboard-destructive-dialog .delete-scene__lift {
    animation: delete-block-enter 240ms ease-out both;
  }

  .dashboard-destructive-dialog .delete-scene__warning {
    opacity: 0;
    animation: delete-accent-enter 190ms ease-out 130ms both;
  }

  .dashboard-destructive-dialog .delete-scene__check {
    opacity: 0;
  }

  .dashboard-destructive-dialog__mark--loading .delete-scene__lift {
    animation: delete-block-lift 420ms ease-out both;
  }

  .dashboard-destructive-dialog__mark--loading .delete-scene__warning,
  .dashboard-destructive-dialog__mark--success .delete-scene__warning {
    animation: none;
    opacity: 0;
  }

  .dashboard-destructive-dialog__mark--success .delete-scene__lift {
    animation: delete-block-finish 300ms ease-in both;
  }

  .dashboard-destructive-dialog__mark--success .delete-scene__check {
    animation: delete-accent-enter 240ms ease-out 90ms both;
  }

  .dashboard-destructive-dialog__mark--error .delete-scene__lift {
    animation: delete-block-resist 360ms ease-in-out both;
  }

  .dashboard-destructive-dialog__mark--error .delete-scene__warning {
    animation: delete-accent-enter 220ms ease-out 170ms both;
  }

  .dashboard-destructive-dialog .dialog-title {
    animation: delete-copy-enter 210ms ease-out 55ms both;
  }

  .dashboard-destructive-dialog .dialog-message {
    animation: delete-copy-enter 210ms ease-out 105ms both;
  }

  @keyframes delete-block-enter {
    0% {
      transform: translateY(-4px) rotate(-1deg);
    }

    70% {
      transform: translateY(1px) rotate(0.5deg);
    }

    100% {
      transform: none;
    }
  }

  @keyframes delete-block-lift {
    100% {
      transform: translateY(-5px);
    }
  }

  @keyframes delete-block-finish {
    0% {
      transform: translateY(-5px);
    }

    100% {
      opacity: 0;
      transform: translateY(-15px);
    }
  }

  @keyframes delete-block-resist {
    0% {
      transform: translateY(-5px);
    }

    40% {
      transform: translate(1px, -7px);
    }

    70% {
      transform: translate(-1px, -3px);
    }

    100% {
      transform: none;
    }
  }

  @keyframes delete-accent-enter {
    0% {
      opacity: 0;
      transform: scale(0.82);
    }

    100% {
      opacity: 1;
      transform: none;
    }
  }

  @keyframes delete-copy-enter {
    0% {
      opacity: 0;
      transform: translateY(4px);
    }

    100% {
      opacity: 1;
      transform: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .delete-dialog.p-dialog-enter-active {
      transition: none;
    }

    .dashboard-destructive-dialog
      :is(
        .delete-scene__lift,
        .delete-scene__warning,
        .delete-scene__check,
        .dialog-title,
        .dialog-message
      ) {
      animation: none;
    }

    .dashboard-destructive-dialog__mark--success .delete-scene__lift,
    .dashboard-destructive-dialog__mark--loading .delete-scene__warning,
    .dashboard-destructive-dialog__mark--success .delete-scene__warning {
      opacity: 0;
    }

    .dashboard-destructive-dialog__mark--success .delete-scene__check,
    .dashboard-destructive-dialog__mark--error .delete-scene__warning,
    .dashboard-destructive-dialog__mark--confirm .delete-scene__warning {
      opacity: 1;
    }
  }
</style>
