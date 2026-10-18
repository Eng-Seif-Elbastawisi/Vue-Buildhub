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
  <button v-if="hasbtn" ref="trigger" type="button" :disabled="disabled" @click="openDialog">
    <slot name="btn"> </slot>
  </button>
  <button
    v-else
    ref="trigger"
    type="button"
    :class="triggerClass"
    :disabled="disabled"
    @click="openDialog"
  >
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
    :aria-label="title"
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
        <i
          :class="
            phase === 'loading'
              ? 'pi pi-spinner pi-spin'
              : phase === 'success'
                ? 'pi pi-check'
                : phase === 'error'
                  ? 'pi pi-exclamation-triangle'
                  : 'pi pi-trash'
          "
        ></i>
      </span>

      <h4 class="dialog-title">{{ title }}</h4>
      <p class="dialog-message" :aria-live="phase === 'error' ? 'assertive' : 'off'">
        {{ phase === 'error' ? backendError : message }}
      </p>
      <div class="flex gap-2 items-center btns">
        <button
          type="button"
          class="btn btn-delete-danger"
          :disabled="disabled || isBusy"
          @click="confirmDelete"
        >
          {{ $t('yes_delete_it') }}
        </button>
        <button type="button" class="btn btn-third" :disabled="isBusy" @click="visible = false">
          {{ $t('cancel') }}
        </button>
      </div>
    </template>
  </Dialog>
</template>

<style lang="scss">
  .dashboard-destructive-dialog .dashboard-destructive-dialog__mark {
    display: grid;
    width: 48px;
    height: 48px;
    place-items: center;
    margin: 0 auto var(--bh-space-4);
    border-radius: 50%;
    color: var(--bh-coral-ink);
    background: var(--bh-coral-soft);
    font-size: var(--bh-text-xl);
  }

  .dashboard-destructive-dialog .dashboard-destructive-dialog__mark--success {
    color: var(--bh-green-ink);
    background: var(--bh-green-soft);
  }
</style>
