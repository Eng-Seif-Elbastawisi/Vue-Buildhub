<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import Dialog from 'primevue/dialog';

  import {
    PackageSubscriptionStatus,
    type PackageSubscriptionStatus as PackageSubscriptionStatusValue,
  } from '../../core/constants/package.subscription.status.enum';

  import type PackageSubscriptionModel from '../../core/models/package.subscription.model';
  import ChangePackageSubscriptionStatusParams from '../../core/params/change.package.subscription.status.params';

  const props = withDefaults(
    defineProps<{
      modelValue: boolean;
      subscription: PackageSubscriptionModel | null;
      status: PackageSubscriptionStatusValue | null;
      loading?: boolean;
    }>(),
    {
      loading: false,
    },
  );

  const emit = defineEmits<{
    'update:modelValue': [value: boolean];
    submit: [params: ChangePackageSubscriptionStatusParams];
  }>();

  const { t } = useI18n();

  const notes = ref('');

  const validationErrors = ref<Record<string, string>>({});

  const dialogVisible = computed<boolean>({
    get: () => props.modelValue,

    set: (value: boolean) => {
      emit('update:modelValue', value);
    },
  });

  const isAcceptAction = computed<boolean>(() => {
    return Number(props.status) === Number(PackageSubscriptionStatus.CONFIRMED);
  });

  const dialogTitle = computed<string>(() => {
    return isAcceptAction.value
      ? t('package.accept_subscription')
      : t('package.reject_subscription');
  });

  const dialogDescription = computed<string>(() => {
    return isAcceptAction.value
      ? t('package.accept_subscription_description')
      : t('package.reject_subscription_description');
  });

  const confirmButtonLabel = computed<string>(() => {
    return isAcceptAction.value ? t('package.accept') : t('package.reject');
  });

  const canSubmit = computed<boolean>(() => {
    return props.subscription !== null && props.status !== null && !props.loading;
  });

  const closeDialog = (): void => {
    if (props.loading) {
      return;
    }

    dialogVisible.value = false;
  };

  const submitStatus = (): void => {
    if (!props.subscription || props.status === null || props.loading) {
      return;
    }

    const params = new ChangePackageSubscriptionStatusParams({
      package_subscription_id: props.subscription.id,

      status: props.status,

      notes: notes.value.trim(),
    });

    const validation = params.validate();

    if (!validation.isValid) {
      validationErrors.value = validation.errors.reduce<Record<string, string>>((errors, error) => {
        errors[error.field] = error.message;

        return errors;
      }, {});

      return;
    }

    validationErrors.value = {};

    emit('submit', params);
  };

  watch(
    [() => props.modelValue, () => props.subscription, () => props.status],
    ([visible, subscription, status]) => {
      if (!visible || !subscription || status === null) {
        return;
      }

      notes.value = '';
      validationErrors.value = {};
    },
    {
      immediate: true,
    },
  );
</script>

<template>
  <Dialog
    v-model:visible="dialogVisible"
    append-to="body"
    modal
    block-scroll
    :base-z-index="10000"
    :closable="!loading"
    :draggable="false"
    :dismissable-mask="false"
    :header="dialogTitle"
    :style="{
      width: '32rem',
      maxWidth: 'calc(100vw - 2rem)',
    }"
    :pt="{
      mask: {
        class: 'package-subscription-decision-dialog-mask',
      },
      root: {
        class: 'package-subscription-decision-dialog-root',
      },
      header: {
        class: 'package-subscription-decision-dialog-header',
      },
      content: {
        class: 'package-subscription-decision-dialog-content',
      },
    }"
  >
    <div class="status-dialog">
      <div
        class="decision-summary"
        :class="{
          'decision-summary--accept': isAcceptAction,
          'decision-summary--reject': !isAcceptAction,
        }"
      >
        <span class="decision-summary__icon">
          <i v-if="isAcceptAction" class="pi pi-check" aria-hidden="true" />

          <i v-else class="pi pi-times" aria-hidden="true" />
        </span>

        <div class="decision-summary__content">
          <strong>
            {{ dialogTitle }}
          </strong>

          <p>
            {{ dialogDescription }}
          </p>
        </div>
      </div>

      <div class="field-group">
        <label class="field-label" for="package-subscription-notes">
          {{ $t('package.notes') }}
        </label>

        <textarea
          id="package-subscription-notes"
          v-model="notes"
          class="field-textarea"
          rows="5"
          :disabled="loading"
          :placeholder="$t('package.notes_placeholder')"
        />

        <small v-if="validationErrors.notes" class="field-error">
          {{ validationErrors.notes }}
        </small>
      </div>

      <div class="dialog-actions">
        <button class="btn btn-secondary" type="button" :disabled="loading" @click="closeDialog">
          {{ $t('cancel') }}
        </button>

        <button
          class="decision-submit-btn"
          :class="{
            'decision-submit-btn--accept': isAcceptAction,
            'decision-submit-btn--reject': !isAcceptAction,
          }"
          type="button"
          :disabled="!canSubmit"
          @click="submitStatus"
        >
          <i v-if="loading" class="pi pi-spin pi-spinner" aria-hidden="true" />

          <i v-else-if="isAcceptAction" class="pi pi-check" aria-hidden="true" />

          <i v-else class="pi pi-times" aria-hidden="true" />

          <span>
            {{ loading ? $t('loading') : confirmButtonLabel }}
          </span>
        </button>
      </div>
    </div>
  </Dialog>
</template>

<style scoped lang="scss">
  .status-dialog,
  .field-group {
    display: flex;
    flex-direction: column;
  }

  .status-dialog {
    gap: 1rem;
  }

  .field-group {
    gap: 0.5rem;
  }

  .decision-summary {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1rem;
    border: 1px solid transparent;
    border-radius: 0.75rem;

    &--accept {
      border-color: var(--success, #16a34a);
      background: var(--success-light, #dcfce7);
    }

    &--reject {
      border-color: var(--danger, #dc2626);
      background: var(--danger-light, #fee2e2);
    }

    &__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 2.25rem;
      width: 2.25rem;
      height: 2.25rem;
      border-radius: 50%;
      color: var(--white, #fff);
      background: var(--gray-700, #374151);
    }

    &--accept &__icon {
      background: var(--success, #16a34a);
    }

    &--reject &__icon {
      background: var(--danger, #dc2626);
    }

    &__content {
      min-width: 0;
    }

    strong,
    p {
      margin: 0;
    }

    p {
      margin-top: 0.25rem;
      color: var(--gray-600, #4b5563);
      font-size: 0.85rem;
    }
  }

  .field-label {
    color: var(--gray-700);
    font-size: 0.85rem;
    font-weight: 700;
  }

  .field-textarea {
    width: 100%;
    min-height: 8rem;
    padding: 0.75rem 1rem;
    border: 1px solid var(--border-weak, #d1d5db);
    border-radius: var(--radius-sm, 0.5rem);
    color: var(--gray-800, #1f2937);
    background: var(--bg-main, #fff);
    outline: none;
    resize: vertical;

    &:focus {
      border-color: var(--PrimaryColor, #2563eb);
      box-shadow: 0 0 0 3px rgb(37 99 235 / 10%);
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.7;
    }
  }

  .field-error {
    color: var(--danger, #dc2626);
    font-size: 0.8rem;
    font-weight: 600;
  }

  .dialog-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.75rem;
    padding-top: 0.5rem;
  }

  .decision-submit-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;
    min-height: 2.75rem;
    padding: 0.65rem 1rem;
    border: 1px solid transparent;
    border-radius: var(--radius-sm, 0.5rem);
    color: var(--white, #fff);
    cursor: pointer;
    font-weight: 700;

    &--accept {
      background: var(--success, #16a34a);
    }

    &--reject {
      background: var(--danger, #dc2626);
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
  }

  /*
 * PrimeVue ينقل الـ Dialog إلى body.
 * هذه الـ classes تخص هذا الـ Dialog فقط.
 */


  @media (max-width: 576px) {
    .dialog-actions {
      align-items: stretch;
      flex-direction: column-reverse;

      button {
        width: 100%;
      }
    }

    :global(.package-subscription-decision-dialog-root) {
      width: calc(100vw - 2rem) !important;
    }
  }
</style>
