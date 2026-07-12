<script setup lang="ts">
  import { ref } from 'vue';
  import { useRoute } from 'vue-router';
  import type AddInvoicePaymentParams from '../../core/params/add.invoice.payment.params';
  import InvoicePaymentController from '../controllers/invoice.payment.controller';
  import InvoicePaymentForm from './InvoicePaymentForm.vue';

  const controller = InvoicePaymentController.getInstance();
  const route = useRoute();
  const formKey = route.fullPath;
  const params = ref<AddInvoicePaymentParams | null>(null);
  const loading = ref(false);

  const savePayment = async () => {
    if (!params.value) return;

    loading.value = true;

    try {
      await controller.create(params.value, undefined, formKey);
    } finally {
      loading.value = false;
    }
  };
</script>

<template>
  <div class="invoice-payment-crud-page">
    <InvoicePaymentForm :form-key="formKey" :loading="loading" @update-data="params = $event" />

    <div class="invoice-payment-actions" :class="{ disabled: loading }">
      <button
        class="btn btn-primary w-full"
        type="button"
        :class="{ 'btn--loading': loading }"
        :disabled="loading"
        @click="savePayment"
      >
        <span v-if="loading" class="loader"></span>
        <span v-else>{{ $t('invoice_payment.save') }}</span>
      </button>
    </div>

    <div v-if="controller.errorMessage.value" class="invoice-payment-error">
      {{ controller.errorMessage.value }}
    </div>
  </div>
</template>

<style lang="scss">
  @use '../styles/invoice_payment';
</style>
