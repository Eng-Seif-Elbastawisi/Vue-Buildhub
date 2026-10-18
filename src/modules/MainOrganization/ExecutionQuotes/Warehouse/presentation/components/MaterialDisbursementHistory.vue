<script setup lang="ts">
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import type { DataState } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import type PurchaseRequestDisbursementModel from '../../core/models/purchase-request-disbursement.model';

  const errorStateSlots = ['failed', 'timeout', 'no-network', 'rate-limited'] as const;
  const props = defineProps<{
    state: DataState<PurchaseRequestDisbursementModel[]>;
    retry: () => Promise<void>;
  }>();
  const emit = defineEmits<{ details: [disbursementId: number] }>();
  const { t, te } = useI18n();
  const history = computed(() => props.state.data ?? []);
</script>
<template>
  <section class="material-receipt__panel" aria-labelledby="disbursement-history-heading">
    <header class="material-receipt__panel-header">
      <div>
        <h2 id="disbursement-history-heading">{{ $t('material_disbursement.history') }}</h2>
        <p>{{ $t('material_disbursement.history_hint') }}</p>
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
            <h3>{{ $t('material_disbursement.no_history') }}</h3>
            <p>{{ $t('material_disbursement.no_history_hint') }}</p>
          </div>
        </template>
        <template #success>
          <div v-if="!history.length" class="material-receipt__empty">
            <i class="pi pi-history" aria-hidden="true" />
            <h3>{{ $t('material_disbursement.no_history') }}</h3>
            <p>{{ $t('material_disbursement.no_history_hint') }}</p>
          </div>
          <div
            v-else
            class="material-receipt__scroll workspace-table-scroll"
            role="region"
            tabindex="0"
            :aria-label="$t('material_disbursement.history')"
          >
            <table
              class="material-receipt__table material-receipt__table--history workspace-data-table"
            >
              <thead>
                <tr>
                  <th scope="col">{{ $t('material_disbursement.issue_date') }}</th>
                  <th scope="col">{{ $t('material_disbursement.receiver') }}</th>
                  <th scope="col">{{ $t('material_disbursement.issued_by') }}</th>
                  <th scope="col">{{ $t('material_disbursement.type') }}</th>
                  <th scope="col">{{ $t('material_disbursement.items_count') }}</th>
                  <th scope="col">{{ $t('material_disbursement.created_at') }}</th>
                  <th scope="col">{{ $t('material_receipt.details') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="entry in history" :key="entry.id">
                  <td>{{ entry.date }}</td>
                  <td>{{ entry.receiver.name }}</td>
                  <td>{{ entry.organizationEmployee.name }}</td>
                  <td>{{ $t('material_disbursement.type_one') }}</td>
                  <td>{{ entry.items.length }}</td>
                  <td>{{ entry.createdAt }}</td>
                  <td>
                    <AppButton
                      type="button"
                      theme="secondary"
                      size="sm"
                      @click="emit('details', entry.id)"
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
