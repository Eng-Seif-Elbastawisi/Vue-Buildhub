<script setup lang="ts">
  import { computed, ref, onBeforeUnmount } from 'vue';
  import Skeleton from 'primevue/skeleton';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import { DataLoading } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import { getDurationTypeNameKey } from '@/modules/shared/Package/core/constants/duration.type.enum';
  import PurchaseRequestPricesController from '../controllers/purchase-request-prices.controller';
  import PurchaseOrderController from '../controllers/purchase.order.controller';
  import type PurchaseRequestPriceModel from '../../core/models/purchase-request.price.model';
  const props = defineProps<{ quoteId: number; purchaseRequestId: number }>();
  const emit = defineEmits<{
    storeOrder: [purchaseRequestId: number, purchaseRequestPriceId?: number];
    manageOffers: [purchaseRequestId: number];
  }>();
  const controller = PurchaseRequestPricesController.getInstance();
  const orders = PurchaseOrderController.getInstance();
  const showStoreActions = computed(() => !controller.readOnly.value);
  const canOpenStore = computed(
    () =>
      showStoreActions.value &&
      controller.loaded.value &&
      !controller.refreshRequired.value &&
      !controller.isSyncing.value &&
      !orders.isIssuing.value &&
      !orders.isStoreBlocked(props.quoteId, props.purchaseRequestId),
  );
  async function refreshAfterOrder() {
    await controller.fetchList();
  }
  async function storeOrder(offer: PurchaseRequestPriceModel) {
    if (
      !canOpenStore.value ||
      !offer.supplier ||
      offer.purchaseRequestId !== props.purchaseRequestId ||
      !(await requestClose())
    )
      return;
    emit('storeOrder', offer.purchaseRequestId, offer.id);
  }
  const filter = ref('');
  const state = computed(() => controller.listState.value);
  const saving = computed(() => controller.isSyncing.value);
  const offers = computed(() =>
    controller.savedOffers.value
      .filter((offer) =>
        (offer.supplier?.name ?? '').toLocaleLowerCase().includes(filter.value.toLocaleLowerCase()),
      )
      .slice()
      .sort((a, b) => (a.supplier?.name ?? '').localeCompare(b.supplier?.name ?? '')),
  );
  if (controller.activate(props.quoteId, props.purchaseRequestId)) {
    void controller.fetchList();
  }
  function requestClose() {
    return Promise.resolve(!saving.value);
  }
  onBeforeUnmount(() => controller.release());
  defineExpose({ requestClose, refreshAfterOrder });
</script>
<template>
  <section
    class="procurement-panel procurement-offers"
    :dir="$i18n.locale === 'ar' ? 'rtl' : 'ltr'"
  >
    <section aria-labelledby="supplier-comparison-heading">
      <header class="procurement-header procurement-section-header">
        <div>
          <h2 id="supplier-comparison-heading">
            <i class="pi pi-tags" aria-hidden="true" />
            <span>{{ $t('procurement.prices_for_request', { id: purchaseRequestId }) }}</span>
          </h2>
          <p>{{ $t('procurement.prices_help') }}</p>
        </div>
        <div class="procurement-actions">
          <AppButton
            type="button"
            theme="secondary"
            :disabled="
              controller.readOnly.value ||
              !controller.loaded.value ||
              saving ||
              controller.refreshRequired.value
            "
            @click="emit('manageOffers', purchaseRequestId)"
            >{{
              $t(
                controller.savedOffers.value.length
                  ? 'procurement.offers.page_title'
                  : 'procurement.add_prices',
              )
            }}</AppButton
          >
          <AppButton
            v-if="showStoreActions"
            type="button"
            :disabled="!canOpenStore || !offers.length"
            @click="emit('storeOrder', purchaseRequestId)"
            ><i class="pi pi-file-edit" aria-hidden="true" />{{
              $t('procurement.orders.issue')
            }}</AppButton
          >
        </div>
      </header>
      <p v-if="controller.readOnly.value" role="status">
        {{ $t('procurement.orders.offers_locked') }}
      </p>
      <Skeleton v-if="state instanceof DataLoading" height="5rem" />
      <div v-else-if="state.hasError && !controller.loaded.value" role="alert">
        <p>{{ $t(state.error?.title ?? 'procurement.offers.fetch_failed') }}</p>
        <p v-if="controller.refreshRequired.value">
          {{
            $t(
              controller.confirmedSync.value
                ? 'procurement.offers.saved_refresh_failed'
                : 'procurement.offers.unconfirmed_sync',
            )
          }}
        </p>
        <AppButton
          type="button"
          theme="secondary"
          :disabled="saving"
          @click="controller.fetchList()"
          >{{ $t('procurement.offers.retry_fetch') }}</AppButton
        >
      </div>
      <p
        v-if="
          controller.confirmedSync.value &&
          !controller.refreshRequired.value &&
          !controller.dirty.value
        "
        role="status"
      >
        {{ $t('procurement.offers.saved') }}
      </p>
      <template v-if="controller.loaded.value || controller.savedOffers.value.length">
        <div
          class="procurement-table-scroll workspace-table-scroll"
          tabindex="0"
          role="region"
          :aria-label="$t('procurement.offers.saved_offers')"
        >
          <table class="procurement-table workspace-data-table">
            <caption class="procurement-sr-only">
              {{
                $t('procurement.offers.saved_offers')
              }}
            </caption>
            <thead>
              <tr>
                <th scope="col">{{ $t('procurement.offers.supplier') }}</th>
                <th scope="col">{{ $t('procurement.offers.price') }}</th>
                <th scope="col">{{ $t('procurement.offers.duration') }}</th>
                <th scope="col">{{ $t('procurement.created_at') }}</th>
                <th v-if="showStoreActions" scope="col">{{ $t('procurement.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!offers.length">
                <td :colspan="showStoreActions ? 5 : 4" class="procurement-empty">
                  {{ $t(filter ? 'procurement.no_matching_prices' : 'procurement.offers.empty') }}
                </td>
              </tr>
              <tr v-for="offer in offers" :key="offer.id">
                <th scope="row">{{ offer.supplier?.name ?? $t('procurement.unavailable') }}</th>
                <td class="procurement-price">
                  {{ offer.price ?? $t('procurement.unavailable') }}
                </td>
                <td>
                  {{ offer.duration ?? $t('procurement.unavailable') }}
                  {{
                    offer.durationType == null
                      ? $t('procurement.unavailable')
                      : $t(getDurationTypeNameKey(offer.durationType))
                  }}
                </td>
                <td>{{ offer.createdAt ?? $t('procurement.unavailable') }}</td>
                <td v-if="showStoreActions">
                  <AppButton
                    type="button"
                    theme="secondary"
                    size="sm"
                    :disabled="!canOpenStore || !offer.supplier"
                    @click="storeOrder(offer)"
                    >{{ $t('procurement.orders.issue') }}</AppButton
                  >
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
      <p
        v-if="
          !controller.loaded.value &&
          controller.savedOffers.value.length &&
          !state.hasError &&
          !(state instanceof DataLoading)
        "
        role="alert"
      >
        {{ $t('procurement.offers.incomplete_collection') }}
      </p>
    </section>
    <div
      v-if="controller.refreshRequired.value && !controller.confirmedSync.value && !state.hasError"
      role="alert"
    >
      <p>{{ $t('procurement.offers.unconfirmed_sync') }}</p>
      <AppButton
        type="button"
        theme="secondary"
        :disabled="saving"
        @click="controller.fetchList()"
        >{{ $t('procurement.offers.retry_fetch') }}</AppButton
      >
    </div>
  </section>
</template>
