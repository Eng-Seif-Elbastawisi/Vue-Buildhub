<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import type AddInvoicePaymentParams from '../../core/params/add.invoice.payment.params';
  import EditInvoicePaymentParams from '../../core/params/edit.invoice.payment.params';
  import ShowInvoicePaymentParams from '../../core/params/show.invoice.payment.params';
  import InvoicePaymentController from '../controllers/invoice.payment.controller';
  import InvoicePaymentForm from './InvoicePaymentForm.vue';

  const controller = InvoicePaymentController.getInstance();
  const route = useRoute();
  const formKey = route.fullPath;
  const paymentId = Number(route.params.id);
  const params = ref<EditInvoicePaymentParams | null>(null);
  const loading = ref(false);

  const updateData = (data: AddInvoicePaymentParams) => {
    params.value = new EditInvoicePaymentParams({
      invoice_payment_id: paymentId,
      invoice_id: data.invoice_id,
      payment_amount: data.payment_amount,
      payment_date: data.payment_date,
      payment_method: data.payment_method,
      notes: data.notes,
    });
  };

  const savePayment = async () => {
    if (!params.value) return;

    loading.value = true;

    try {
      await controller.update(params.value, undefined, formKey);
    } finally {
      loading.value = false;
    }
  };

  onMounted(async () => {
    await controller.fetchOne(new ShowInvoicePaymentParams({ invoice_payment_id: paymentId }));
  });
</script>

<template>
  <div class="invoice-payment-crud-page">
    <InvoicePaymentForm
      :payment="controller.itemData.value"
      :form-key="formKey"
      :loading="loading"
      @update-data="updateData"
    />

    <div class="invoice-payment-actions actions" :class="{ disabled: loading }">
      <button
        class="btn btn-primary w-full"
        type="button"
        :class="{ 'btn--loading': loading }"
        :disabled="loading"
        @click="savePayment"
      >
        <span v-if="loading" class="loader"></span>
        <span v-else>{{ $t('invoice_payment.update') }}</span>
      </button>
    </div>

    <div v-if="controller.errorMessage.value" class="invoice-payment-error error">
      {{ controller.errorMessage.value }}
    </div>
  </div>
</template>

<style lang="scss">
  @use '../styles/invoice_payment';
</style>
