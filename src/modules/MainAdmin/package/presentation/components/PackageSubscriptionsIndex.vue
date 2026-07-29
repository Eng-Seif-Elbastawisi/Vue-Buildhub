<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';

import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
import AppTable, {
  type TableHeader,
} from '@/shared/HelpersComponents/AppTable.vue';
import TableSkelaton from '@/shared/HelpersComponents/TableSkelaton.vue';

import {
  PackageSubscriptionStatus,
  type PackageSubscriptionStatus as PackageSubscriptionStatusValue,
} from '../../core/constants/package.subscription.status.enum';

import PackageSubscriptionModel from '../../core/models/package.subscription.model';
import type ChangePackageSubscriptionStatusParams from '../../core/params/change.package.subscription.status.params';
import FetchPackageSubscriptionsParams from '../../core/params/fetch.package.subscriptions.params';

import PackageSubscriptionController from '../controllers/package.subscription.controller';
import PackageSubscriptionStatusDialog from './PackageSubscriptionStatusDialog.vue';

const controller =
  PackageSubscriptionController.getInstance();

const state = computed(
  () => controller.listState.value,
);

const selectedSubscription =
  ref<PackageSubscriptionModel | null>(null);

const selectedActionStatus =
  ref<PackageSubscriptionStatusValue | null>(null);

const statusDialogVisible = ref(false);
const statusUpdating = ref(false);

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

const formatDateTime = (
  rawDateTime: string,
): string => {
  const normalizedValue = rawDateTime.trim();

  if (!normalizedValue) {
    return '-';
  }

  const date = new Date(
    normalizedValue.replace(' ', 'T'),
  );

  if (Number.isNaN(date.getTime())) {
    return normalizedValue;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

const normalizeSubscriptions = (
  rawStateData: unknown,
): PackageSubscriptionModel[] => {
  if (!Array.isArray(rawStateData)) {
    return [];
  }

  return rawStateData.filter(
    (
      subscription,
    ): subscription is PackageSubscriptionModel =>
      subscription instanceof PackageSubscriptionModel,
  );
};

const fetchSubscriptions =
  async (): Promise<void> => {
    await controller.fetchPackageSubscriptions(
      new FetchPackageSubscriptionsParams(),
    );
  };

const openStatusDialog = (
  subscription: PackageSubscriptionModel,
  status: PackageSubscriptionStatusValue,
): void => {
  selectedSubscription.value = subscription;
  selectedActionStatus.value = status;
  statusDialogVisible.value = true;
};

const resetStatusDialog = (): void => {
  selectedSubscription.value = null;
  selectedActionStatus.value = null;
};

const submitStatusChange = async (
  params: ChangePackageSubscriptionStatusParams,
): Promise<void> => {
  if (statusUpdating.value) {
    return;
  }

  statusUpdating.value = true;

  try {
    const result =
      await controller.changePackageSubscriptionStatus(
        params,
      );

    if (!(result instanceof DataSuccess)) {
      return;
    }

    statusDialogVisible.value = false;

    await fetchSubscriptions();
  } finally {
    statusUpdating.value = false;
  }
};

watch(statusDialogVisible, (visible) => {
  if (!visible && !statusUpdating.value) {
    resetStatusDialog();
  }
});

onMounted(async () => {
  await fetchSubscriptions();
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

      <button
        class="btn btn-secondary"
        type="button"
        @click="fetchSubscriptions"
      >
        <i
          class="pi pi-refresh"
          aria-hidden="true"
        />

        {{ $t('try_again') }}
      </button>
    </div>

    <DataStatusBuilder
      :controller="state"
      :on-retry="fetchSubscriptions"
    >
      <template #success="{ data }">
        <div
          v-if="
            normalizeSubscriptions(data).length === 0
          "
          class="empty-state"
        >
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
            <div class="decision-actions">
              <!-- Accept -->
              <button
                class="
                  decision-btn
                  decision-btn--accept
                "
                type="button"
                :disabled="statusUpdating"
                :title="$t('package.accept')"
                :aria-label="$t('package.accept')"
                @click.stop="
                  openStatusDialog(
                    item,
                    PackageSubscriptionStatus.CONFIRMED,
                  )
                "
              >
                <i
                  class="pi pi-check"
                  aria-hidden="true"
                />
              </button>

              <!-- Reject -->
              <button
                class="
                  decision-btn
                  decision-btn--reject
                "
                type="button"
                :disabled="statusUpdating"
                :title="$t('package.reject')"
                :aria-label="$t('package.reject')"
                @click.stop="
                  openStatusDialog(
                    item,
                    PackageSubscriptionStatus.REJECTED,
                  )
                "
              >
                <i
                  class="pi pi-times"
                  aria-hidden="true"
                />
              </button>
            </div>
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
            {{
              $t(
                'package.fetch_subscriptions_error',
              )
            }}
          </h3>

          <p>
            {{
              error?.displayMessage ||
              $t(
                'package.fetch_subscriptions_error',
              )
            }}
          </p>

          <button
            class="btn btn-secondary"
            type="button"
            @click="retry"
          >
            {{ $t('try_again') }}
          </button>
        </div>
      </template>

      <template #loader>
        <TableSkelaton
          :columns="headers.length"
          :rows="5"
        />
      </template>
    </DataStatusBuilder>

    <PackageSubscriptionStatusDialog
      v-model="statusDialogVisible"
      :subscription="selectedSubscription"
      :status="selectedActionStatus"
      :loading="statusUpdating"
      @submit="submitStatusChange"
    />
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.decision-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.4rem;
  height: 2.4rem;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 50%;
  cursor: pointer;
  font-size: 0.9rem;
  transition:
    transform 0.2s ease,
    opacity 0.2s ease,
    box-shadow 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  &--accept {
    border-color: var(--success, #16a34a);
    color: var(--success-dark, #166534);
    background: var(--success-light, #dcfce7);

    &:hover:not(:disabled) {
      box-shadow:
        0 4px 12px rgb(22 163 74 / 25%);
    }
  }

  &--reject {
    border-color: var(--danger, #dc2626);
    color: var(--danger-dark, #991b1b);
    background: var(--danger-light, #fee2e2);

    &:hover:not(:disabled) {
      box-shadow:
        0 4px 12px rgb(220 38 38 / 25%);
    }
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
}
</style>