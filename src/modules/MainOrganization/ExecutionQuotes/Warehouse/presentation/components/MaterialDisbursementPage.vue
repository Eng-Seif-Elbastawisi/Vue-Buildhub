<script setup lang="ts">
  import { computed, onBeforeUnmount, ref, watch } from 'vue';
  import { useRoute } from 'vue-router';
  import { useI18n } from 'vue-i18n';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import ProjectWorkspaceNav from '../../../presentation/components/ProjectWorkspaceNav.vue';
  import { quotePath } from '../../../Schedule/presentation/schedule.routes';
  import { validId } from '../../../Schedule/core/constants/schedule.constants';
  import MaterialDisbursementController from '../controllers/material-disbursement.controller';
  import WarehouseFeatureNav from './WarehouseFeatureNav.vue';
  import MaterialDisbursementFormDialog from './MaterialDisbursementFormDialog.vue';
  import MaterialDisbursementHistory from './MaterialDisbursementHistory.vue';
  import MaterialDisbursementDetailsDialog from './MaterialDisbursementDetailsDialog.vue';

  const errorStateSlots = ['failed', 'timeout', 'no-network', 'rate-limited'] as const;
  const route = useRoute();
  const { t, te } = useI18n();
  const controller = MaterialDisbursementController.getInstance();
  const quoteId = computed(() => Number(route.params.id));
  const dialogVisible = ref(false);
  const detailId = ref<number | null>(null);
  const detailVisible = computed({
    get: () => detailId.value !== null,
    set: (visible: boolean) => {
      if (!visible) detailId.value = null;
    },
  });
  const detail = computed(() =>
    controller.historyState.value.data?.find((row) => row.id === detailId.value),
  );
  const stock = computed(() => controller.listState.value.data ?? []);
  function displayError(value?: string | null) {
    return value && te(value) ? t(value) : (value ?? '');
  }
  async function retryStock() {
    await controller.loadStock();
  }
  async function retryHistory() {
    await controller.loadHistory();
  }
  watch(
    quoteId,
    (id) => {
      dialogVisible.value = false;
      detailId.value = null;
      controller.activate(id);
      if (validId(id)) void controller.load();
    },
    { immediate: true },
  );
  onBeforeUnmount(() => controller.release());
</script>
<template>
  <section
    class="material-receipt material-disbursement"
    :dir="$i18n.locale === 'ar' ? 'rtl' : 'ltr'"
  >
    <p v-if="!validId(quoteId)" role="alert">{{ $t('material_receipt.invalid_quote') }}</p>
    <template v-else>
      <ProjectWorkspaceNav :quote-id="quoteId" active="warehouse" />
      <header class="material-receipt__intro">
        <div>
          <h1>
            <i class="pi pi-upload" aria-hidden="true" />{{ $t('material_disbursement.title') }}
          </h1>
          <p>{{ $t('material_disbursement.subtitle') }}</p>
          <RouterLink :to="quotePath(route.path, quoteId)" class="material-receipt__back">
            <i class="pi pi-arrow-left" aria-hidden="true" />{{ $t('material_receipt.back') }}
          </RouterLink>
        </div>
        <AppButton
          type="button"
          :disabled="controller.isStoring.value"
          @click="dialogVisible = true"
        >
          <i class="pi pi-plus" aria-hidden="true" />{{
            $t('material_disbursement.issue_materials')
          }}
        </AppButton>
      </header>

      <WarehouseFeatureNav :quote-id="quoteId" :current-path="route.path" active="disbursement" />

      <section class="material-receipt__panel" aria-labelledby="disbursement-stock-heading">
        <header class="material-receipt__panel-header">
          <div>
            <h2 id="disbursement-stock-heading">
              {{ $t('material_disbursement.available_stock') }}
            </h2>
            <p>{{ $t('material_disbursement.stock_hint') }}</p>
          </div>
          <span v-if="stock.length" class="material-receipt__count">{{ stock.length }}</span>
        </header>
        <div class="material-receipt__panel-body">
          <DataStatusBuilder
            :controller="controller.listState.value"
            :on-retry="retryStock"
            use-skeleton
          >
            <template
              v-for="slotName in errorStateSlots"
              :key="slotName"
              #[slotName]="{ state: resourceState }"
            >
              <div>
                <p role="alert">{{ displayError(resourceState.error?.displayMessage) }}</p>
                <AppButton type="button" theme="secondary" @click="retryStock">{{
                  $t('material_receipt.retry')
                }}</AppButton>
              </div>
            </template>
            <template #empty>
              <div class="material-receipt__empty">
                <i class="pi pi-box" aria-hidden="true" />
                <h3>{{ $t('material_disbursement.no_stock') }}</h3>
                <p>{{ $t('material_disbursement.no_stock_hint') }}</p>
              </div>
            </template>
            <template #success>
              <div v-if="!stock.length" class="material-receipt__empty">
                <i class="pi pi-box" aria-hidden="true" />
                <h3>{{ $t('material_disbursement.no_stock') }}</h3>
                <p>{{ $t('material_disbursement.no_stock_hint') }}</p>
              </div>
              <div
                v-else
                class="material-receipt__scroll"
                role="region"
                tabindex="0"
                :aria-label="$t('material_disbursement.available_stock')"
              >
                <table class="material-receipt__table material-disbursement__stock-table">
                  <thead>
                    <tr>
                      <th scope="col">{{ $t('material_receipt.item') }}</th>
                      <th scope="col">{{ $t('material_disbursement.received_quantity') }}</th>
                      <th scope="col">{{ $t('material_disbursement.disbursed_quantity') }}</th>
                      <th scope="col">{{ $t('material_disbursement.available_quantity') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in stock" :key="row.purchaseRequestItem.id">
                      <th scope="row">
                        {{ row.purchaseRequestItem.title
                        }}<small>#{{ row.purchaseRequestItem.id }}</small>
                      </th>
                      <td>{{ row.receivedQuantity }}</td>
                      <td>{{ row.disbursedQuantity }}</td>
                      <td>
                        <strong :class="{ 'material-receipt__remaining--zero': !row.canIssue }">{{
                          row.availableQuantity
                        }}</strong>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </template>
          </DataStatusBuilder>
        </div>
      </section>

      <MaterialDisbursementHistory
        :state="controller.historyState.value"
        :retry="retryHistory"
        @details="detailId = $event"
      />
      <MaterialDisbursementFormDialog :key="quoteId" v-model:visible="dialogVisible" />
      <MaterialDisbursementDetailsDialog v-model:visible="detailVisible" :disbursement="detail" />
    </template>
  </section>
</template>
<style lang="scss" src="../styles/material-receipt.scss"></style>
