<script setup lang="ts">
  import { computed, ref, onBeforeUnmount, watch, nextTick } from 'vue';
  import Dialog from 'primevue/dialog';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import {
    DataSuccess,
    type DataState,
  } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import PurchaseRequestPricesController from '../controllers/purchase-request-prices.controller';
  import SupplierOfferRow from './SupplierOfferRow.vue';
  defineProps<{ quoteId: number; purchaseRequestId: number }>();
  const emit = defineEmits<{ close: [] }>();
  const controller = PurchaseRequestPricesController.getInstance();
  const discardVisible = ref(false);
  const removalHeading = ref<HTMLElement | null>(null);
  const discardHeading = ref<HTMLElement | null>(null);
  watch(
    () => controller.confirmationVisible.value,
    async (visible) => {
      if (visible) {
        await nextTick();
        removalHeading.value?.focus();
      }
    },
  );
  watch(discardVisible, async (visible) => {
    if (visible) {
      await nextTick();
      discardHeading.value?.focus();
    }
  });
  let closeResolver: ((allowed: boolean) => void) | undefined;
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
  function requestClose(): Promise<boolean> {
    if (saving.value) return Promise.resolve(false);
    if (
      !controller.dirty.value ||
      (controller.confirmedSync.value && controller.refreshRequired.value)
    )
      return Promise.resolve(true);
    if (closeResolver) return Promise.resolve(false);
    discardVisible.value = true;
    return new Promise((resolve) => {
      closeResolver = resolve;
    });
  }
  function discard(allowed: boolean) {
    discardVisible.value = false;
    closeResolver?.(allowed);
    closeResolver = undefined;
  }
  async function close() {
    if (await requestClose()) emit('close');
  }
  onBeforeUnmount(() => {
    closeResolver?.(false);
  });
  function completeSave(saved: DataState<void> | undefined) {
    if (
      saved instanceof DataSuccess &&
      !controller.refreshRequired.value &&
      !controller.dirty.value
    )
      emit('close');
  }
  async function saveOffers() {
    completeSave(await controller.save());
  }
  async function confirmOffers() {
    completeSave(await controller.confirmSave());
  }
  defineExpose({ requestClose });
</script>
<template>
  <Dialog
    :visible="true"
    modal
    :header="$t('procurement.offers.title')"
    :style="{ width: '70rem', maxWidth: '96vw' }"
    :closable="!saving"
    :close-on-escape="!saving"
    :dismissable-mask="false"
    @update:visible="close"
  >
    <div class="procurement-offers" :dir="$i18n.locale === 'ar' ? 'rtl' : 'ltr'">
      <p>{{ $t('procurement.offers.request_reference', { id: purchaseRequestId }) }}</p>
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
      <form novalidate @submit.prevent="saveOffers">
        <h2>{{ $t('procurement.offers.manage') }}</h2>
        <p>{{ $t('procurement.offers.sync_help') }}</p>
        <div
          v-if="storeError && !controller.confirmedSync.value"
          class="procurement-error"
          role="alert"
        >
          <p>{{ $t(storeError.title) }}</p>
          <p v-for="(messages, field) in storeError.validationErrors" :key="field">
            {{ field }}: {{ messages.join(' · ') }}
          </p>
        </div>
        <p
          v-if="controller.errors.value.some((error) => error.field === 'suppliers')"
          class="procurement-error"
          role="alert"
        >
          {{ $t('procurement.offers.duplicate_supplier') }}
        </p>
        <SupplierOfferRow
          v-for="(row, index) in controller.draft.value"
          :key="row.key"
          :row="row"
          :index="index"
          :disabled="locked || !controller.loaded.value"
          :errors="controller.errors.value"
          @update="controller.updateRow(row.key, $event)"
          @remove="controller.removeSupplier(row.key)"
        />
        <AppButton
          type="button"
          theme="secondary"
          :disabled="locked || !controller.loaded.value"
          @click="controller.addSupplier()"
          >{{ $t('procurement.offers.add_supplier') }}</AppButton
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
          <AppButton
            type="button"
            theme="secondary"
            :disabled="saving"
            @click="controller.cancelConfirmation()"
            >{{ $t('procurement.cancel') }}</AppButton
          >
          <AppButton type="button" :disabled="saving" @click="confirmOffers">{{
            $t('procurement.offers.confirm_save')
          }}</AppButton>
        </section>
        <section
          v-if="discardVisible"
          class="procurement-offers-confirmation"
          role="alertdialog"
          aria-labelledby="supplier-discard-heading"
        >
          <h3 id="supplier-discard-heading" ref="discardHeading" tabindex="-1">
            {{ $t('procurement.offers.discard_changes') }}
          </h3>
          <AppButton type="button" theme="secondary" @click="discard(false)">{{
            $t('procurement.offers.keep_editing')
          }}</AppButton>
          <AppButton type="button" @click="discard(true)">{{
            $t('procurement.offers.discard')
          }}</AppButton>
        </section>
        <footer class="procurement-actions">
          <AppButton type="button" theme="secondary" :disabled="saving" @click="close">{{
            $t('procurement.cancel')
          }}</AppButton>
          <AppButton
            type="submit"
            :disabled="
              !controller.canSave.value || controller.confirmationVisible.value || discardVisible
            "
            :loading="saving"
            >{{ $t('procurement.offers.save_all') }}</AppButton
          >
        </footer>
      </form>
    </div>
  </Dialog>
</template>
