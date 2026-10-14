<script setup lang="ts">
  import { computed, ref, onBeforeUnmount } from 'vue';
  import Skeleton from 'primevue/skeleton';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import { DataLoading } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import { getDurationTypeNameKey } from '@/modules/shared/Package/core/constants/duration.type.enum';
  import PurchaseRequestPricesController from '../controllers/purchase-request-prices.controller';
  import SupplierPriceOffersDialog from './SupplierPriceOffersDialog.vue';
  const props = defineProps<{ quoteId: number; purchaseRequestId: number }>();
  const controller = PurchaseRequestPricesController.getInstance();
  const editorVisible = ref(false);
  const editor = ref<InstanceType<typeof SupplierPriceOffersDialog> | null>(null);
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
  if (controller.activate(props.quoteId, props.purchaseRequestId)) void controller.fetchList();
  function closeEditor() {
    controller.discardDraft();
    editorVisible.value = false;
  }
  function requestClose() {
    return editor.value ? editor.value.requestClose() : Promise.resolve(!saving.value);
  }
  onBeforeUnmount(() => controller.release());
  defineExpose({ requestClose });
</script>
<template>
  <section
    class="procurement-panel procurement-offers"
    :dir="$i18n.locale === 'ar' ? 'rtl' : 'ltr'"
  >
    <section aria-labelledby="supplier-comparison-heading">
      <header class="procurement-header">
        <div>
          <h2 id="supplier-comparison-heading">
            {{ $t('procurement.prices_for_request', { id: purchaseRequestId }) }}
          </h2>
          <p>{{ $t('procurement.prices_help') }}</p>
        </div>
        <AppButton
          type="button"
          :disabled="
            controller.readOnly.value ||
            !controller.loaded.value ||
            saving ||
            controller.refreshRequired.value
          "
          @click="editorVisible = true"
          >{{
            $t(
              controller.savedOffers.value.length
                ? 'procurement.offers.manage'
                : 'procurement.add_prices',
            )
          }}</AppButton
        >
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
        <!-- <div v-if="controller.savedOffers.value.length" class="field-group input-wrapper">
          <span class="field-help-label-row field-help-label-row--block"
            ><label class="field-label label" for="supplier-comparison-filter">{{
              $t('procurement.offers.filter_supplier')
            }}</label>
            <FieldHelpIcon
              :label="$t('procurement.offers.filter_supplier')"
              field-name="filter_supplier"
              field-id="supplier-comparison-filter"
              :help-text="$t('field_help.execution_fields.filter_supplier')"
            />
          </span>
          <input id="supplier-comparison-filter" v-model="filter" class="input" type="search" />
        </div> -->
        <div class="procurement-table-scroll">
          <table class="procurement-table">
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
              </tr>
            </thead>
            <tbody>
              <tr v-if="!offers.length">
                <td colspan="4" class="procurement-empty">
                  {{ $t(filter ? 'procurement.no_matching_prices' : 'procurement.offers.empty') }}
                </td>
              </tr>
              <tr v-for="offer in offers" :key="offer.id">
                <th scope="row">{{ offer.supplier?.name ?? $t('procurement.unavailable') }}</th>
                <td>{{ offer.price ?? $t('procurement.unavailable') }}</td>
                <td>
                  {{ offer.duration ?? $t('procurement.unavailable') }}
                  {{
                    offer.durationType == null
                      ? $t('procurement.unavailable')
                      : $t(getDurationTypeNameKey(offer.durationType))
                  }}
                </td>
                <td>{{ offer.createdAt ?? $t('procurement.unavailable') }}</td>
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
    <SupplierPriceOffersDialog
      v-if="editorVisible"
      ref="editor"
      :quote-id="quoteId"
      :purchase-request-id="purchaseRequestId"
      @close="closeEditor"
    />
  </section>
</template>
