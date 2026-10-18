<script setup lang="ts">
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import type { DataState } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import type PurchaseRequestReceiptModel from '../../core/models/purchase-request-receipt.model';

  const errorStateSlots = ['failed', 'timeout', 'no-network', 'rate-limited'] as const;
  const props = defineProps<{
    state: DataState<PurchaseRequestReceiptModel[]>;
    retry: () => Promise<void>;
  }>();
  const emit = defineEmits<{ details: [receiptId: number] }>();
  const { t, te } = useI18n();
  const history = computed(() => props.state.data ?? []);
</script>
<template>
  <section class="material-receipt__panel" aria-labelledby="receipt-history-heading">
    <header class="material-receipt__panel-header">
      <div>
        <h2 id="receipt-history-heading">{{ $t('material_receipt.history') }}</h2>
        <p>{{ $t('material_receipt.history_hint') }}</p>
      </div>
      <span v-if="history.length" class="material-receipt__count">{{ history.length }}</span>
    </header>
    <div class="material-receipt__panel-body">
      <DataStatusBuilder :controller="state" :on-retry="retry" use-skeleton>
        <template
          v-for="slotName in errorStateSlots"
          :key="slotName"
          #[slotName]="{ state: resourceState }"
        >
          <div>
            <p role="alert">
              {{
                resourceState.error?.displayMessage && te(resourceState.error.displayMessage)
                  ? t(resourceState.error.displayMessage)
                  : resourceState.error?.displayMessage
              }}
            </p>
            <AppButton type="button" theme="secondary" @click="retry">{{
              $t('material_receipt.retry')
            }}</AppButton>
          </div>
        </template>
        <template #empty>
          <div class="material-receipt__empty">
            <i class="pi pi-history" aria-hidden="true" />
            <h3>{{ $t('material_receipt.no_receipts') }}</h3>
            <p>{{ $t('material_receipt.no_receipts_hint') }}</p>
          </div>
        </template>
        <template #success>
          <div v-if="!history.length" class="material-receipt__empty">
            <i class="pi pi-history" aria-hidden="true" />
            <h3>{{ $t('material_receipt.no_receipts') }}</h3>
            <p>{{ $t('material_receipt.no_receipts_hint') }}</p>
          </div>
          <div
            v-else
            class="material-receipt__scroll workspace-table-scroll"
            role="region"
            tabindex="0"
            :aria-label="$t('material_receipt.history')"
          >
            <table
              class="material-receipt__table material-receipt__table--history workspace-data-table"
            >
              <thead>
                <tr>
                  <th scope="col">{{ $t('material_receipt.receipt_date') }}</th>
                  <th scope="col">{{ $t('material_receipt.receiving_employee') }}</th>
                  <th scope="col">{{ $t('material_receipt.recorded_by') }}</th>
                  <th scope="col">{{ $t('material_receipt.status') }}</th>
                  <th scope="col">{{ $t('material_receipt.items_count') }}</th>
                  <th scope="col">{{ $t('material_receipt.created_at') }}</th>
                  <th scope="col">{{ $t('material_receipt.details') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="receipt in history" :key="receipt.id">
                  <td>{{ receipt.date }}</td>
                  <td>{{ receipt.employee?.name ?? $t('procurement.unavailable') }}</td>
                  <td>{{ receipt.organizationEmployee.name }}</td>
                  <td>
                    <span
                      class="material-receipt__status bh-status"
                      :class="
                        receipt.status === 2
                          ? 'material-receipt__status--complete'
                          : 'material-receipt__status--partial'
                      "
                      >{{
                        $t(
                          receipt.status === 1
                            ? 'material_receipt.partial'
                            : 'material_receipt.complete',
                        )
                      }}</span
                    >
                  </td>
                  <td>{{ receipt.items.length }}</td>
                  <td>{{ receipt.createdAt }}</td>
                  <td>
                    <AppButton
                      type="button"
                      theme="secondary"
                      size="sm"
                      @click="emit('details', receipt.id)"
                      >{{ $t('material_receipt.details') }}</AppButton
                    >
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </DataStatusBuilder>
    </div>
  </section>
</template>
