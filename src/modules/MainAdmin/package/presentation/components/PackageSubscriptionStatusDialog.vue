```vue
<script setup lang="ts">
  import { computed, onBeforeUnmount, ref, watch } from 'vue';
  import { useI18n } from 'vue-i18n';

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
    return !!props.subscription && props.status !== null && !props.loading;
  });

  const closeDialog = (): void => {
    if (props.loading) {
      return;
    }

    emit('update:modelValue', false);
  };

  const handleBackdropClick = (): void => {
    closeDialog();
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

  /**
   * منع Scroll الصفحة أثناء فتح الـ Modal.
   */
  watch(
    () => props.modelValue,
    (visible) => {
      if (typeof document === 'undefined') {
        return;
      }

      if (visible) {
        document.body.classList.add('package-subscription-modal-open');

        notes.value = '';

        validationErrors.value = {};

        return;
      }

      document.body.classList.remove('package-subscription-modal-open');
    },
    {
      immediate: true,
    },
  );

  onBeforeUnmount(() => {
    if (typeof document !== 'undefined') {
      document.body.classList.remove('package-subscription-modal-open');
    }
  });
</script>

<template>
  <Teleport to="body">
    <Transition name="subscription-modal">
      <div
        v-if="modelValue"
        class="package-subscription-modal"
        role="dialog"
        aria-modal="true"
        :aria-label="dialogTitle"
        @keydown.esc="closeDialog"
      >
        <!-- Backdrop -->
        <button
          class="package-subscription-modal__backdrop"
          type="button"
          tabindex="-1"
          aria-label="Close"
          @click="handleBackdropClick"
        />

        <!-- Dialog -->
        <section class="package-subscription-modal__panel" @click.stop>
          <!-- Header -->
          <header class="package-subscription-modal__header">
            <div class="package-subscription-modal__header-content">
              <span
                class="package-subscription-modal__header-icon"
                :class="{
                  'package-subscription-modal__header-icon--accept': isAcceptAction,

                  'package-subscription-modal__header-icon--reject': !isAcceptAction,
                }"
              >
                <i v-if="isAcceptAction" class="pi pi-check" aria-hidden="true" />

                <i v-else class="pi pi-times" aria-hidden="true" />
              </span>

              <div>
                <h2>
                  {{ dialogTitle }}
                </h2>

                <p>
                  {{ dialogDescription }}
                </p>
              </div>
            </div>

            <button
              class="package-subscription-modal__close"
              type="button"
              :disabled="loading"
              @click="closeDialog"
            >
              <i class="pi pi-times" aria-hidden="true" />
            </button>
          </header>

          <!-- Body -->
          <div class="package-subscription-modal__body">
            <!-- Subscription info -->
            <div v-if="subscription" class="subscription-info">
              <span class="subscription-info__icon">
                <i class="pi pi-box" aria-hidden="true" />
              </span>

              <div>
                <span class="subscription-info__label">
                  {{ $t('package.subscription_id') }}
                </span>

                <strong> #{{ subscription.id }} </strong>
              </div>
            </div>

            <!-- Notes -->
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
          </div>

          <!-- Footer -->
          <footer class="package-subscription-modal__footer">
            <button class="modal-cancel-btn" type="button" :disabled="loading" @click="closeDialog">
              {{ $t('cancel') }}
            </button>

            <button
              class="modal-submit-btn"
              :class="{
                'modal-submit-btn--accept': isAcceptAction,

                'modal-submit-btn--reject': !isAcceptAction,
              }"
              type="button"
              :disabled="!canSubmit"
              @click="submitStatus"
            >
              <i v-if="loading" class="pi pi-spin pi-spinner" />

              <i v-else-if="isAcceptAction" class="pi pi-check" />

              <i v-else class="pi pi-times" />

              <span>
                {{ loading ? $t('loading') : confirmButtonLabel }}
              </span>
            </button>
          </footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
  .package-subscription-modal {
    position: fixed !important;
    inset: 0 !important;
    z-index: 999999 !important;
    display: flex !important;
    align-items: center;
    justify-content: center;
    width: 100vw;
    height: 100vh;
    padding: 1rem;
    isolation: isolate;
  }

  .package-subscription-modal__backdrop {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
    background: rgba(15, 23, 42, 0.55);
    backdrop-filter: blur(3px);
    cursor: default;
  }

  .package-subscription-modal__panel {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    width: min(32rem, 100%);
    max-height: calc(100vh - 2rem);
    overflow: hidden;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-lg, 16px);
    background: var(--BgWhite, #fff);
    color: var(--gray-900, #0f172a);
    box-shadow: 0 30px 90px rgba(15, 23, 42, 0.3);
  }

  .package-subscription-modal__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    padding: 1.25rem;
    border-bottom: 1px solid var(--border-weak);
  }

  .package-subscription-modal__header-content {
    display: flex;
    align-items: flex-start;
    min-width: 0;
    gap: 0.85rem;

    h2 {
      margin: 0;
      color: var(--gray-900);
      font-family: 'Bold';
      font-size: 1.05rem;
    }

    p {
      margin: 0.35rem 0 0;
      color: var(--gray-500);
      font-size: var(--xs-size);
    }
  }

  .package-subscription-modal__header-icon {
    display: inline-flex;
    width: 42px;
    height: 42px;
    flex: 0 0 42px;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    color: #fff;

    &--accept {
      background: var(--success, #16a34a);
    }

    &--reject {
      background: var(--danger, #dc2626);
    }
  }

  .package-subscription-modal__close {
    display: inline-flex;
    width: 36px;
    height: 36px;
    flex: 0 0 36px;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--border-weak);
    border-radius: 50%;
    background: var(--BgWhite);
    color: var(--gray-500);
    cursor: pointer;
    transition: 0.2s ease;

    &:hover:not(:disabled) {
      border-color: var(--danger);
      background: var(--danger-light);
      color: var(--danger);
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
  }

  .package-subscription-modal__body {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.25rem;
    overflow-y: auto;
  }

  .subscription-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.85rem 1rem;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-md);
    background: var(--gray-50);

    strong {
      display: block;
      color: var(--gray-900);
      font-family: 'Bold';
    }
  }

  .subscription-info__icon {
    display: inline-flex;
    width: 38px;
    height: 38px;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    background: var(--PrimaryColor-light);
    color: var(--PrimaryColor);
  }

  .subscription-info__label {
    display: block;
    margin-bottom: 0.1rem;
    color: var(--gray-500);
    font-size: var(--xs-size);
  }

  .field-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .field-label {
    color: var(--gray-700);
    font-family: 'Medium';
    font-size: var(--sm-size);
    font-weight: 600;
  }

  .field-textarea {
    width: 100%;
    min-height: 130px;
    padding: 0.85rem 1rem;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-md);
    background: var(--BgWhite);
    color: var(--gray-900);
    font-family: var(--font-family);
    outline: none;
    resize: vertical;
    transition: 0.2s ease;

    &:focus {
      border-color: var(--PrimaryColor);
      box-shadow: 0 0 0 3px var(--PrimaryColor-light);
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.65;
    }
  }

  .field-error {
    color: var(--danger);
    font-size: var(--xs-size);
    font-weight: 600;
  }

  .package-subscription-modal__footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.75rem;
    padding: 1rem 1.25rem;
    border-top: 1px solid var(--border-weak);
    background: var(--gray-50);
  }

  .modal-cancel-btn,
  .modal-submit-btn {
    display: inline-flex;
    min-height: 44px;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;
    padding: 0.65rem 1.1rem;
    border-radius: 50px;
    cursor: pointer;
    font-family: 'Medium';
    font-weight: 600;
    transition: 0.2s ease;
  }

  .modal-cancel-btn {
    border: 1px solid var(--border-weak);
    background: var(--BgWhite);
    color: var(--gray-700);

    &:hover:not(:disabled) {
      border-color: var(--gray-400);
      background: var(--gray-100);
    }
  }

  .modal-submit-btn {
    border: 1px solid transparent;
    color: #fff;

    &--accept {
      background: var(--success);
    }

    &--reject {
      background: var(--danger);
    }

    &:hover:not(:disabled) {
      transform: translateY(-1px);
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.55;
    }
  }

  .subscription-modal-enter-active,
  .subscription-modal-leave-active {
    transition: opacity 0.2s ease;
  }

  .subscription-modal-enter-active .package-subscription-modal__panel,
  .subscription-modal-leave-active .package-subscription-modal__panel {
    transition:
      transform 0.2s ease,
      opacity 0.2s ease;
  }

  .subscription-modal-enter-from,
  .subscription-modal-leave-to {
    opacity: 0;
  }

  .subscription-modal-enter-from .package-subscription-modal__panel {
    opacity: 0;
    transform: translateY(10px) scale(0.97);
  }

  :global(body.package-subscription-modal-open) {
    overflow: hidden !important;
  }

  @media (max-width: 576px) {
    .package-subscription-modal {
      padding: 0.75rem;
    }

    .package-subscription-modal__panel {
      width: 100%;
    }

    .package-subscription-modal__footer {
      align-items: stretch;
      flex-direction: column-reverse;
    }

    .modal-cancel-btn,
    .modal-submit-btn {
      width: 100%;
    }
  }
</style>
```
