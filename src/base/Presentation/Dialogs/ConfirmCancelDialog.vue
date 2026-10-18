<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import Dialog from 'primevue/dialog';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';

  export type DialogTheme = 'primary' | 'danger' | 'warning';

  const props = withDefaults(
    defineProps<{
      modelValue?: boolean;
      title?: string;
      message?: string;
      confirmLabel?: string;
      cancelLabel?: string;
      confirmTheme?: DialogTheme;
      hasbtn?: boolean;
      triggerLabel?: string;
      triggerClass?: string;
      disabled?: boolean;
    }>(),
    {
      modelValue: undefined,
      title: undefined,
      message: undefined,
      confirmLabel: undefined,
      cancelLabel: undefined,
      confirmTheme: 'primary',
      hasbtn: true,
      triggerLabel: undefined,
      triggerClass: undefined,
      disabled: false,
    },
  );

  const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void;
    (e: 'update:modelValue', value: boolean): void;
    (e: 'confirm'): void;
    (e: 'cancel'): void;
  }>();

  const internalVisible = ref(false);

  const visible = computed({
    get: () => (props.modelValue !== undefined ? props.modelValue : internalVisible.value),
    set: (val: boolean) => {
      internalVisible.value = val;
      emit('update:visible', val);
      emit('update:modelValue', val);
    },
  });

  watch(
    () => props.modelValue,
    (newVal) => {
      if (newVal !== undefined) {
        internalVisible.value = newVal;
      }
    },
  );

  const open = () => {
    if (props.disabled) return;
    visible.value = true;
  };

  const close = () => {
    visible.value = false;
    emit('cancel');
  };

  const confirm = () => {
    visible.value = false;
    emit('confirm');
  };

  defineExpose({
    open,
    close,
    visible,
  });
</script>

<template>
  <slot name="trigger" :open="open">
    <slot v-if="props.hasbtn && !$slots.trigger" name="btn" :open="open">
      <AppButton
        class="btn-cancel"
        :class="props.triggerClass"
        theme="secondary"
        :disabled="props.disabled"
        :title="props.triggerLabel ?? $t('cancel')"
        type="button"
        @click="open"
      >
        {{ props.triggerLabel ?? $t('cancel') }}
      </AppButton>
    </slot>
  </slot>

  <Dialog
    v-model:visible="visible"
    modal
    :draggable="false"
    :dismissable-mask="true"
    :style="{ width: '420px', maxWidth: '92vw' }"
    :pt="{
      root: 'confirm-cancel-dialog',
      mask: 'confirm-cancel-mask',
    }"
  >
    <template #container>
      <div class="confirm-cancel-container">
        <div class="dialog-icon-wrapper" :class="`icon--${props.confirmTheme}`">
          <svg
            class="dialog-icon-svg"
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M12 9V14M12 17.5V18M10.29 3.86L1.82 18A2 2 0 003.55 21H20.45A2 2 0 0022.18 18L13.71 3.86A2 2 0 0010.29 3.86Z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>

        <h4 class="dialog-title">
          {{ props.title || $t('cancel_changes') }}
        </h4>

        <p class="dialog-message">
          {{ props.message || $t('are_you_sure_you_want_to_leave') }}
        </p>

        <div class="dialog-actions">
          <button type="button" class="btn-dialog btn-dialog-cancel" @click="close">
            {{ props.cancelLabel || $t('cancel') }}
          </button>

          <button
            type="button"
            class="btn-dialog btn-dialog-confirm"
            :class="`btn-${props.confirmTheme}`"
            @click="confirm"
          >
            {{ props.confirmLabel || $t('confirm') }}
          </button>
        </div>
      </div>
    </template>
  </Dialog>
</template>

<style lang="scss">
  @use '@/styles/variables' as *;

  .confirm-cancel-dialog.p-dialog {
    background-color: var(--bh-surface-raised);
    color: var(--gray-900);
    border-radius: var(--bh-radius-card);
    box-shadow: var(--bh-shadow-dialog);
    border: 0;
    overflow: hidden;
    font-family: var(--font-family);

    .confirm-cancel-container {
      padding: 2.25rem 2rem 1.75rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      background-color: var(--bh-surface-raised);
    }

    .dialog-icon-wrapper {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.25rem;
      transition: var(--transition);

      &.icon--primary {
        background-color: var(--PrimaryColor-light);
        color: var(--PrimaryColor);
        border: 1px solid var(--border-waiting);
      }

      &.icon--danger {
        background-color: var(--danger-light);
        color: var(--danger);
        border: 1px solid var(--danger-border-light);
      }

      &.icon--warning {
        background-color: var(--warning-light);
        color: var(--warning-dark);
        border: 1px solid var(--border-waiting);
      }
    }

    .dialog-title {
      font-family: var(--bh-font);
      font-size: 1.25rem;
      font-weight: 500;
      color: var(--gray-900);
      margin: 0 0 0.5rem;
      line-height: 1.35;
    }

    .dialog-message {
      font-family: 'Medium', var(--font-family);
      font-size: 0.95rem;
      font-weight: 500;
      color: var(--gray-500);
      margin: 0 0 1.75rem;
      line-height: 1.5;
      max-width: 100%;
    }

    .dialog-actions {
      display: flex;
      gap: 0.875rem;
      width: 100%;
      align-items: center;
      justify-content: center;
    }

    .btn-dialog {
      flex: 1;
      height: 44px;
      border-radius: var(--radius-full);
      font-family: 'Medium', var(--font-family);
      font-size: 0.9rem;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: var(--transition-fast);
      outline: none;
      border: 1px solid transparent;
    }

    .btn-dialog-cancel {
      border-color: var(--gray-300);
      background-color: var(--bh-surface-raised);
      color: var(--gray-700);

      &:hover {
        background-color: var(--gray-100);
        border-color: var(--gray-400);
        color: var(--gray-900);
      }
    }

    .btn-dialog-confirm {
      color: var(--white);
      box-shadow: none;

      &.btn-primary {
        background-color: var(--PrimaryColor);

        &:hover {
          background-color: var(--PrimaryColor-hover);
          box-shadow: none;
          transform: none;
        }
      }

      &.btn-danger {
        background-color: var(--danger-alt);

        &:hover {
          background-color: var(--danger-dark);
          box-shadow: none;
          transform: none;
        }
      }

      &.btn-warning {
        background-color: var(--warning);

        &:hover {
          background-color: var(--warning-dark);
          box-shadow: none;
          transform: none;
        }
      }
    }
  }
</style>
