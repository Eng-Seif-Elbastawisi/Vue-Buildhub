<script setup lang="ts">
  import { computed, onBeforeUnmount, watch } from 'vue';
  import Dialog from 'primevue/dialog';
  import Skeleton from 'primevue/skeleton';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import {
    DataLoading,
    DataSuccess,
  } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import PurchaseOrderController from '../controllers/purchase.order.controller';
  import PurchaseOrderDetails from './PurchaseOrderDetails.vue';

  const props = defineProps<{ quoteId: number; purchaseRequestId: number }>();
  const emit = defineEmits<{ close: [] }>();
  const controller = PurchaseOrderController.getInstance();
  const fetchState = computed(() => controller.fetchState.value);

  watch(
    () => [props.quoteId, props.purchaseRequestId],
    () => {
      if (controller.activate(props.quoteId, props.purchaseRequestId)) void controller.fetchOne();
    },
    { immediate: true },
  );
  onBeforeUnmount(() => controller.release());
</script>
<template>
  <Dialog
    :visible="true"
    class="procurement-dialog procurement-order-dialog workspace-dialog"
    modal
    :header="$t('procurement.orders.title')"
    :style="{ width: '52rem', maxWidth: '96vw' }"
    @update:visible="emit('close')"
  >
    <div :dir="$i18n.locale === 'ar' ? 'rtl' : 'ltr'">
      <p>{{ $t('procurement.offers.request_reference', { id: purchaseRequestId }) }}</p>
      <Skeleton v-if="fetchState instanceof DataLoading" height="6rem" />
      <div v-if="fetchState.hasError" role="alert">
        <p>{{ $t(fetchState.error?.title || 'procurement.orders.fetch_failed') }}</p>
        <AppButton type="button" theme="secondary" @click="controller.fetchOne()">{{
          $t('procurement.offers.retry_fetch')
        }}</AppButton>
      </div>
      <PurchaseOrderDetails v-if="fetchState.data" :order="fetchState.data" />
      <template v-else-if="fetchState instanceof DataSuccess">
        <p>{{ $t('procurement.orders.empty') }}</p>
        <p v-if="controller.request.value?.status === 1">
          {{ $t('procurement.orders.issue_from_prices') }}
        </p>
      </template>
      <div class="procurement-actions mt-2">
        <AppButton type="button" theme="secondary" @click="emit('close')">{{
          $t('close')
        }}</AppButton>
      </div>
    </div>
  </Dialog>
</template>
