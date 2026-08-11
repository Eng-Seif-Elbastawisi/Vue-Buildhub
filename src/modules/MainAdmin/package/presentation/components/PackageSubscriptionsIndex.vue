<script setup lang="ts">
  import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
  import { useI18n } from 'vue-i18n';

  import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import AppTable, { type TableHeader } from '@/shared/HelpersComponents/AppTable.vue';
  import TableSkelaton from '@/shared/HelpersComponents/TableSkelaton.vue';

  import {
    PackageSubscriptionStatus,
    type PackageSubscriptionStatus as PackageSubscriptionStatusValue,
  } from '../../core/constants/package.subscription.status.enum';

  import PackageSubscriptionModel from '../../core/models/package.subscription.model';
  import ChangePackageSubscriptionStatusParams from '../../core/params/change.package.subscription.status.params';
  import FetchPackageSubscriptionsParams from '../../core/params/fetch.package.subscriptions.params';
  import PackageSubscriptionController from '../controllers/package.subscription.controller';

  const controller = PackageSubscriptionController.getInstance();
  const { t } = useI18n();

  const state = computed(() => controller.listState.value);

  const selectedSubscription = ref<PackageSubscriptionModel | null>(null);

  const selectedActionStatus = ref<PackageSubscriptionStatusValue | null>(null);

  const statusDialogVisible = ref(false);
  const statusUpdating = ref(false);

  const notes = ref('');

  const validationErrors = ref<Record<string, string>>({});

  const handledSubscriptionIds = ref<Set<number>>(new Set());

  const headers: TableHeader[] = [
    {
      key: 'id',
      label: 'package.subscription_id',
      sortable: true,
      width: '5rem',
    },
    {
      key: 'packageTitle',
      label: 'package.title',
      sortable: true,
      width: '14rem',
    },
    {
      key: 'organizationName',
      label: 'package.organization',
      width: '12rem',
    },
    {
      key: 'employeeName',
      label: 'package.organization_employee',
      width: '12rem',
    },
    {
      key: 'adminName',
      label: 'package.admin',
      width: '11rem',
    },
    {
      key: 'originalPrice',
      label: 'package.original_price',
      align: 'center',
      width: '9rem',
    },
    {
      key: 'priceAfterDiscount',
      label: 'package.price_after_discount',
      align: 'center',
      width: '10rem',
    },
    {
      key: 'durationDisplay',
      label: 'package.duration',
      align: 'center',
      width: '8rem',
    },
    {
      key: 'created_at',
      label: 'package.created_at',
      width: '12rem',
    },
    {
      key: 'actions',
      label: 'package.actions',
      align: 'center',
      width: '10rem',
    },
  ];

  const isAcceptAction = computed<boolean>(() => {
    return Number(selectedActionStatus.value) === Number(PackageSubscriptionStatus.CONFIRMED);
  });

  const dialogTitle = computed<string>(() => {
    return isAcceptAction.value ? t('package.accept_subscription') : t('package.reject_subscription');
  });

  const dialogDescription = computed<string>(() => {
    return isAcceptAction.value
      ? t('package.accept_subscription_description')
      : t('package.reject_subscription_description');
  });

  const formatDateTime = (rawDateTime: string): string => {
    const normalizedValue = rawDateTime?.trim?.() ?? '';

    if (!normalizedValue) {
      return '-';
    }

    const date = new Date(normalizedValue.replace(' ', 'T'));

    if (Number.isNaN(date.getTime())) {
      return normalizedValue;
    }

    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  };

  const normalizeSubscriptions = (rawStateData: unknown): PackageSubscriptionModel[] => {
    if (!Array.isArray(rawStateData)) {
      return [];
    }

    return rawStateData.filter(
      (subscription): subscription is PackageSubscriptionModel =>
        subscription instanceof PackageSubscriptionModel,
    );
  };

  const isSubscriptionHandled = (subscription: PackageSubscriptionModel): boolean => {
    const status = Number(subscription.status);

    return (
      handledSubscriptionIds.value.has(subscription.id) ||
      status === Number(PackageSubscriptionStatus.CONFIRMED) ||
      status === Number(PackageSubscriptionStatus.REJECTED)
    );
  };

  const fetchSubscriptions = async (): Promise<void> => {
    await controller.fetchPackageSubscriptions(new FetchPackageSubscriptionsParams());
  };

  const openStatusDialog = (
    subscription: PackageSubscriptionModel,
    status: PackageSubscriptionStatusValue,
  ): void => {
    selectedSubscription.value = subscription;
    selectedActionStatus.value = status;

    notes.value = '';
    validationErrors.value = {};

    statusDialogVisible.value = true;
    document.body.style.overflow = 'hidden';
  };

  const resetStatusDialog = (): void => {
    selectedSubscription.value = null;
    selectedActionStatus.value = null;

    notes.value = '';
    validationErrors.value = {};
  };

  const closeStatusDialog = (): void => {
    if (statusUpdating.value) {
      return;
    }

    statusDialogVisible.value = false;

    resetStatusDialog();

    document.body.style.overflow = '';
  };

  const markSubscriptionAsHandled = (subscriptionId: number): void => {
    handledSubscriptionIds.value = new Set([...handledSubscriptionIds.value, subscriptionId]);
  };

  const submitStatusChange = async (): Promise<void> => {
    if (
      statusUpdating.value ||
      !selectedSubscription.value ||
      selectedActionStatus.value === null
    ) {
      return;
    }

    const subscriptionId = selectedSubscription.value.id;

    const params = new ChangePackageSubscriptionStatusParams({
      package_subscription_id: subscriptionId,

      status: selectedActionStatus.value,

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
    statusUpdating.value = true;

    let updatedSuccessfully = false;

    try {
      const result = await controller.changePackageSubscriptionStatus(params);

      updatedSuccessfully = result instanceof DataSuccess;

      if (updatedSuccessfully) {
        /*
         * نخفي الأزرار فورًا قبل إعادة جلب البيانات.
         */
        markSubscriptionAsHandled(subscriptionId);
      }
    } finally {
      statusUpdating.value = false;
    }

    if (!updatedSuccessfully) {
      return;
    }

    /*
     * الإغلاق يتم بعد جعل loading = false،
     * لأن closeStatusDialog يمنع الإغلاق أثناء التحميل.
     */
    closeStatusDialog();

    await fetchSubscriptions();
  };

  onMounted(async () => {
    await fetchSubscriptions();
  });

  onBeforeUnmount(() => {
    document.body.style.overflow = '';
  });
</script>

<template>
  <div class="package-subscriptions-page">
    <div class="package-subscriptions-header">
      <div>
        <h4>
          {{ $t('package.subscriptions_title') }}
        </h4>

        <p>
          {{ $t('package.subscriptions_description') }}
        </p>
      </div>

      <button class="btn btn-secondary" type="button" @click="fetchSubscriptions">
        <i class="pi pi-refresh" aria-hidden="true" />

        {{ $t('try_again') }}
      </button>
    </div>

    <DataStatusBuilder :controller="state" :on-retry="fetchSubscriptions">
      <template #success="{ data }">
        <div v-if="normalizeSubscriptions(data).length === 0" class="empty-state">
          <h3>
            {{ $t('package.no_subscriptions') }}
          </h3>
        </div>

        <AppTable
          v-else
          :headers="headers"
          :items="normalizeSubscriptions(data)"
          row-key="id"
          hoverable
          striped
        >
          <template #cell-created_at="{ item }">
            {{ formatDateTime(item.created_at) }}
          </template>

          <template #cell-actions="{ item }">
            <div v-if="!isSubscriptionHandled(item)" class="decision-actions">
              <!-- Accept -->
              <button
                class="decision-btn decision-btn--accept"
                type="button"
                :disabled="statusUpdating"
                :title="$t('package.accept')"
                :aria-label="$t('package.accept')"
                @click.prevent.stop="openStatusDialog(item, PackageSubscriptionStatus.CONFIRMED)"
              >
                <i class="pi pi-check" aria-hidden="true" />
              </button>

              <!-- Reject -->
              <button
                class="decision-btn decision-btn--reject"
                type="button"
                :disabled="statusUpdating"
                :title="$t('package.reject')"
                :aria-label="$t('package.reject')"
                @click.prevent.stop="openStatusDialog(item, PackageSubscriptionStatus.REJECTED)"
              >
                <i class="pi pi-times" aria-hidden="true" />
              </button>
            </div>

            <span v-else class="decision-completed">
              <i class="pi pi-check-circle" aria-hidden="true" />

              {{ $t('package.status_updated') }}
            </span>
          </template>
        </AppTable>
      </template>

      <template #empty>
        <div class="empty-state">
          <h3>
            {{ $t('package.no_subscriptions') }}
          </h3>
        </div>
      </template>

      <template #failed="{ error, retry }">
        <div class="error-state">
          <h3>
            {{ $t('package.fetch_subscriptions_error') }}
          </h3>

          <p>
            {{ error?.displayMessage || $t('package.fetch_subscriptions_error') }}
          </p>

          <button class="btn btn-secondary" type="button" @click="retry">
            {{ $t('try_again') }}
          </button>
        </div>
      </template>

      <template #loader>
        <TableSkelaton :columns="headers.length" :rows="5" />
      </template>
    </DataStatusBuilder>

    <Teleport to="body">
      <div v-if="statusDialogVisible" class="subscription-decision-modal">
        <div class="subscription-decision-modal__backdrop" @click="closeStatusDialog" />

        <section class="subscription-decision-modal__panel" @click.stop>
          <header class="subscription-decision-modal__header">
            <div class="modal-title-group">
              <span
                class="modal-status-icon"
                :class="{
                  'modal-status-icon--accept': isAcceptAction,

                  'modal-status-icon--reject': !isAcceptAction,
                }"
              >
                <i :class="isAcceptAction ? 'pi pi-check' : 'pi pi-times'" />
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
              class="modal-close-btn"
              type="button"
              :disabled="statusUpdating"
              @click="closeStatusDialog"
            >
              <i class="pi pi-times" aria-hidden="true" />
            </button>
          </header>

          <div class="subscription-decision-modal__body">
            <div v-if="selectedSubscription" class="subscription-card">
              <span class="subscription-card__icon">
                <i class="pi pi-box" aria-hidden="true" />
              </span>

              <div>
                <small>{{ $t('package.subscription_id') }}</small>

                <strong> #{{ selectedSubscription.id }} </strong>
              </div>
            </div>

            <div class="field-group">
              <label for="subscription-status-notes">
                {{ $t('package.notes') }}
              </label>

              <textarea
                id="subscription-status-notes"
                v-model="notes"
                rows="5"
                :disabled="statusUpdating"
                :placeholder="$t('package.notes_placeholder')"
              />

              <small v-if="validationErrors.notes" class="field-error">
                {{ validationErrors.notes }}
              </small>
            </div>
          </div>

          <footer class="subscription-decision-modal__footer">
            <button
              class="modal-cancel-btn"
              type="button"
              :disabled="statusUpdating"
              @click="closeStatusDialog"
            >
              {{ $t('cancel') }}
            </button>

            <button
              class="modal-confirm-btn"
              :class="{
                'modal-confirm-btn--accept': isAcceptAction,

                'modal-confirm-btn--reject': !isAcceptAction,
              }"
              type="button"
              :disabled="statusUpdating"
              @click="submitStatusChange"
            >
              <i v-if="statusUpdating" class="pi pi-spin pi-spinner" aria-hidden="true" />

              <i
                v-else
                :class="isAcceptAction ? 'pi pi-check' : 'pi pi-times'"
                aria-hidden="true"
              />

              <span>
                {{
                  statusUpdating
                    ? $t('loading')
                    : isAcceptAction
                      ? $t('package.accept')
                      : $t('package.reject')
                }}
              </span>
            </button>
          </footer>
        </section>
      </div>
    </Teleport>
  </div>
</template>

<style scoped lang="scss">
  .package-subscriptions-page,
  .package-subscriptions-header {
    display: flex;
  }

  .package-subscriptions-page {
    flex-direction: column;
    gap: 1.5rem;
  }

  .package-subscriptions-header {
    align-items: center;
    justify-content: space-between;
    gap: 1rem;

    h4,
    p {
      margin: 0;
    }

    p {
      margin-top: 0.25rem;
      color: var(--gray-5);
    }
  }

  .decision-actions {
    position: relative;
    z-index: 5;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .decision-btn {
    position: relative;
    z-index: 6;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.4rem;
    height: 2.4rem;
    padding: 0;
    border: 1px solid transparent;
    border-radius: 50%;
    cursor: pointer;
    pointer-events: auto !important;
    transition:
      transform 0.2s ease,
      opacity 0.2s ease;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
    }

    &--accept {
      border-color: var(--success, #16a34a);
      color: var(--success-dark, #166534);
      background: var(--success-light, #dcfce7);
    }

    &--reject {
      border-color: var(--danger, #dc2626);
      color: var(--danger-dark, #991b1b);
      background: var(--danger-light, #fee2e2);
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
  }

  .decision-completed {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    min-height: 2.4rem;
    padding: 0.4rem 0.75rem;
    border: 1px solid var(--success, #16a34a);
    border-radius: 50px;
    color: var(--success-dark, #166534);
    background: var(--success-light, #dcfce7);
    font-size: 0.8rem;
    font-weight: 600;
    white-space: nowrap;
  }

  .subscription-decision-modal {
    position: fixed !important;
    inset: 0 !important;
    z-index: 2147483647 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: 100vw !important;
    height: 100vh !important;
    padding: 1rem;
    pointer-events: auto !important;
  }

  .subscription-decision-modal__backdrop {
    position: absolute;
    inset: 0;
    background: rgb(15 23 42 / 60%);
    backdrop-filter: blur(3px);
  }

  .subscription-decision-modal__panel {
    position: relative;
    z-index: 1;
    width: min(520px, calc(100vw - 2rem));
    max-height: calc(100vh - 2rem);
    overflow: hidden;
    border: 1px solid var(--border-weak);
    border-radius: 20px;
    background: var(--BgWhite, #fff);
    box-shadow: 0 25px 80px rgb(0 0 0 / 30%);
  }

  .subscription-decision-modal__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    padding: 1.25rem;
    border-bottom: 1px solid var(--border-weak);
  }

  .modal-title-group {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;

    h2 {
      margin: 0;
      color: var(--gray-900);
      font-family: 'Bold';
      font-size: 1.05rem;
    }

    p {
      margin: 0.35rem 0 0;
      color: var(--gray-500);
      font-size: 0.85rem;
    }
  }

  .modal-status-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 42px;
    width: 42px;
    height: 42px;
    border-radius: 50%;
    color: #fff;

    &--accept {
      background: var(--success, #16a34a);
    }

    &--reject {
      background: var(--danger, #dc2626);
    }
  }

  .modal-close-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: 1px solid var(--border-weak);
    border-radius: 50%;
    color: var(--gray-500);
    background: var(--BgWhite, #fff);
    cursor: pointer;
  }

  .subscription-decision-modal__body {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.25rem;
  }

  .subscription-card {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.85rem 1rem;
    border: 1px solid var(--border-weak);
    border-radius: 12px;
    background: var(--gray-50);

    small {
      display: block;
      color: var(--gray-500);
    }

    strong {
      display: block;
      color: var(--gray-900);
    }
  }

  .subscription-card__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 12px;
    color: var(--PrimaryColor);
    background: var(--PrimaryColor-light);
  }

  .field-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    label {
      color: var(--gray-700);
      font-weight: 600;
    }

    textarea {
      width: 100%;
      min-height: 120px;
      padding: 0.8rem 1rem;
      border: 1px solid var(--border-weak);
      border-radius: 12px;
      color: var(--gray-900);
      background: var(--BgWhite, #fff);
      outline: none;
      resize: vertical;

      &:focus {
        border-color: var(--PrimaryColor);
        box-shadow: 0 0 0 3px var(--PrimaryColor-light);
      }
    }
  }

  .field-error {
    color: var(--danger, #dc2626);
    font-size: 0.8rem;
  }

  .subscription-decision-modal__footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.75rem;
    padding: 1rem 1.25rem;
    border-top: 1px solid var(--border-weak);
    background: var(--gray-50);
  }

  .modal-cancel-btn,
  .modal-confirm-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    min-height: 44px;
    padding: 0.65rem 1.1rem;
    border-radius: 50px;
    cursor: pointer;
    font-weight: 600;
  }

  .modal-cancel-btn {
    border: 1px solid var(--border-weak);
    color: var(--gray-700);
    background: var(--BgWhite, #fff);
  }

  .modal-confirm-btn {
    border: 0;
    color: #fff;

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

  .empty-state,
  .error-state {
    padding: 3rem 1rem;
    text-align: center;

    h3,
    p {
      margin: 0;
    }

    p {
      margin-top: 0.5rem;
      color: var(--gray-5);
    }

    .btn {
      margin: 1rem auto 0;
    }
  }

  @media (max-width: 768px) {
    .package-subscriptions-header {
      align-items: flex-start;
      flex-direction: column;
    }

    .subscription-decision-modal__footer {
      align-items: stretch;
      flex-direction: column-reverse;
    }

    .modal-cancel-btn,
    .modal-confirm-btn {
      width: 100%;
    }
  }
</style>
