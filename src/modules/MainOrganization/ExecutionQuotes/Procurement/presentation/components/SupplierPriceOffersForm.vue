<script setup lang="ts">
  import StandardFormLayout from '@/shared/components/form/StandardFormLayout.vue';
  import { computed, ref, watch, nextTick } from 'vue';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import Skeleton from 'primevue/skeleton';
  import {
    DataLoading,
    DataSuccess,
    type DataState,
  } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import PurchaseRequestPricesController from '../controllers/purchase-request-prices.controller';
  import SupplierOfferRow from './SupplierOfferRow.vue';
  const emit = defineEmits<{ cancel: []; saved: [] }>();
  const controller = PurchaseRequestPricesController.getInstance();
  const removalHeading = ref<HTMLElement | null>(null);
  const formRef = ref<InstanceType<typeof StandardFormLayout> | null>(null);
  watch(
    () => controller.confirmationVisible.value,
    async (visible) => {
      if (visible) {
        await nextTick();
        removalHeading.value?.focus();
      }
    },
  );
  const state = computed(() => controller.listState.value);
  const saving = computed(() => controller.isSyncing.value);
  const locked = computed(
    () =>
      controller.readOnly.value ||
      saving.value ||
      controller.confirmationVisible.value ||
      controller.refreshRequired.value,
  );
  const storeError = computed(() => controller.itemState.value.error);
  const displayedErrors = computed(() => {
    const aliases: Record<string, string> = {
      supplier_id: 'supplierId',
      duration_type: 'durationType',
    };
    const backend = Object.entries(storeError.value?.validationErrors ?? {}).flatMap(
      ([field, messages]) => {
        const parts = field.split('.');
        const last = parts.pop() ?? '';
        const mapped =
          last === 'id' && parts[0] === 'suppliers' ? 'supplierId' : (aliases[last] ?? last);
        return messages.map((message) => ({
          field: [...parts, mapped].join('.'),
          message,
        }));
      },
    );
    return [...controller.errors.value, ...backend];
  });
  const otherMessages = computed(() =>
    displayedErrors.value.filter((error) => !/^suppliers\.\d+\./.test(error.field)),
  );
  async function focusFirstInvalid() {
    await nextTick();
    const first = displayedErrors.value.find((error) => /^suppliers\.\d+\./.test(error.field));
    if (!first) return;
    const match = first.field.match(/^suppliers\.(\d+)\.(supplierId|price|duration|durationType)$/);
    if (!match) return;
    const row = controller.draft.value[Number(match[1])];
    const suffix =
      match[2] === 'supplierId' ? 'supplier' : match[2] === 'durationType' ? 'unit' : match[2];
    const control = (formRef.value?.$el as HTMLElement | undefined)?.querySelector<HTMLElement>(
      `#supplier-offer-${row?.key}-${suffix}`,
    );
    control?.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
    control?.focus();
  }
  function completeSave(saved: DataState<void> | undefined) {
    if (
      saved instanceof DataSuccess &&
      !controller.refreshRequired.value &&
      !controller.dirty.value
    )
      emit('saved');
  }
  async function saveOffers() {
    completeSave(await controller.save());
    if (displayedErrors.value.length) await focusFirstInvalid();
  }
  async function confirmOffers() {
    completeSave(await controller.confirmSave());
    if (displayedErrors.value.length) await focusFirstInvalid();
  }
</script>
<template>
  <StandardFormLayout
    ref="formRef"
    as="form"
    embedded
    novalidate
    class="procurement-form supplier-prices-form"
    :aria-busy="saving"
    :dir="$i18n.locale === 'ar' ? 'rtl' : 'ltr'"
    @submit.prevent="saveOffers"
  >
    <section class="procurement-panel" aria-labelledby="supplier-offers-heading">
      <header class="procurement-header procurement-section-header">
        <div>
          <h2 id="supplier-offers-heading">{{ $t('procurement.offers.title') }}</h2>
          <p>{{ $t('procurement.offers.sync_help') }}</p>
        </div>
      </header>
      <Skeleton v-if="state instanceof DataLoading" height="5rem" />
      <div v-if="state.hasError && !controller.loaded.value" role="alert">
        <p>{{ $t(state.error?.title ?? 'procurement.offers.fetch_failed') }}</p>
      </div>
      <div v-if="controller.refreshRequired.value" role="alert">
        <p>
          {{
            $t(
              controller.confirmedSync.value
                ? 'procurement.offers.saved_refresh_failed'
                : 'procurement.offers.unconfirmed_sync',
            )
          }}
        </p>
      </div>
      <AppButton
        v-if="(state.hasError && !controller.loaded.value) || controller.refreshRequired.value"
        type="button"
        theme="secondary"
        :disabled="saving"
        @click="controller.fetchList()"
        >{{ $t('procurement.offers.retry_fetch') }}</AppButton
      >
      <p
        v-if="storeError && !Object.keys(storeError.validationErrors ?? {}).length"
        class="procurement-error"
        role="alert"
      >
        {{ $t(storeError.title) }}
      </p>
      <p
        v-for="(error, index) in otherMessages"
        :key="index"
        class="procurement-error"
        role="alert"
      >
        {{ $t(error.message) }}
      </p>
      <p v-if="controller.readOnly.value" role="status">
        {{ $t('procurement.orders.offers_locked') }}
      </p>
      <p
        v-if="controller.loaded.value && !controller.draft.value.length"
        class="supplier-prices-empty"
        role="status"
      >
        {{ $t('procurement.offers.empty') }}
      </p>
      <div class="supplier-prices-rows">
        <SupplierOfferRow
          v-for="(row, index) in controller.draft.value"
          :key="row.key"
          :row="row"
          :index="index"
          :disabled="locked || !controller.loaded.value"
          :errors="displayedErrors"
          @update="controller.updateRow(row.key, $event)"
          @remove="controller.removeSupplier(row.key)"
        />
      </div>
      <AppButton
        type="button"
        theme="secondary"
        :disabled="locked || !controller.loaded.value"
        @click="controller.addSupplier()"
        >{{
          $t(
            controller.draft.value.length
              ? 'procurement.offers.add_another_supplier'
              : 'procurement.offers.add_supplier',
          )
        }}</AppButton
      >
      <section
        v-if="controller.confirmationVisible.value"
        class="procurement-offers-confirmation"
        role="alertdialog"
        aria-labelledby="supplier-removal-heading"
        aria-describedby="supplier-removal-description"
      >
        <h3 id="supplier-removal-heading" ref="removalHeading" tabindex="-1">
          {{
            $t(
              controller.draft.value.length
                ? 'procurement.offers.confirm_removal'
                : 'procurement.offers.confirm_clear',
            )
          }}
        </h3>
        <p id="supplier-removal-description">{{ $t('procurement.offers.removal_help') }}</p>
        <ul>
          <li v-for="offer in controller.removedOffers.value" :key="offer.id">
            {{ offer.supplier?.name ?? $t('procurement.unavailable') }}
          </li>
        </ul>
        <div class="procurement-actions">
          <AppButton
            type="button"
            theme="secondary"
            :disabled="saving"
            @click="controller.cancelConfirmation()"
            >{{ $t('procurement.cancel') }}</AppButton
          >
          <AppButton type="button" :loading="saving" @click="confirmOffers">{{
            $t('procurement.offers.confirm_save')
          }}</AppButton>
        </div>
      </section>
    </section>
    <footer class="procurement-actions procurement-create__actions">
      <AppButton type="button" theme="secondary" :disabled="saving" @click="emit('cancel')">{{
        $t('procurement.cancel')
      }}</AppButton>
      <AppButton
        type="submit"
        :disabled="!controller.canSave.value || controller.confirmationVisible.value"
        :loading="saving"
        >{{ $t('procurement.offers.save_prices') }}</AppButton
      >
    </footer>
  </StandardFormLayout>
</template>
