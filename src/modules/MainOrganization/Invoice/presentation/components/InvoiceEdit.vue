<script setup lang="ts">
  import StandardFormLayout from '@/shared/components/form/StandardFormLayout.vue';
  import { onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import type AddInvoiceParams from '../../core/params/add.invoice.params';
  import EditInvoiceParams from '../../core/params/edit.invoice.params';
  import ShowInvoiceParams from '../../core/params/show.invoice.params';
  import InvoiceController from '../controllers/invoice.controller';
  import InvoiceForm from './InvoiceForm.vue';

  const controller = InvoiceController.getInstance();
  const route = useRoute();
  const formKey = route.fullPath;
  const invoiceId = Number(route.params.id);
  const params = ref<EditInvoiceParams | null>(null);
  const loading = ref(false);

  const updateData = (data: AddInvoiceParams) => {
    params.value = new EditInvoiceParams({
      invoice_id: invoiceId,
      project_id: data.project_id,
      invoice_number: data.invoice_number,
      invoice_date: data.invoice_date,
      invoice_amount: data.invoice_amount,
      notes: data.notes,
    });
  };

  const saveInvoice = async () => {
    if (!params.value) return;

    loading.value = true;

    try {
      await controller.update(params.value, undefined, formKey);
    } finally {
      loading.value = false;
    }
  };

  onMounted(async () => {
    await controller.fetchOne(new ShowInvoiceParams({ invoice_id: invoiceId }));
  });
</script>

<template>
  <StandardFormLayout mode="edit" class="invoice-crud-page">
    <InvoiceForm
      :invoice="controller.itemData.value"
      :form-key="formKey"
      :loading="loading"
      submit-label-key="invoice.update"
      @update-data="updateData"
      @submit="saveInvoice"
    />

    <div v-if="controller.errorMessage.value" class="invoice-error" aria-live="polite">
      {{ controller.errorMessage.value }}
    </div>
  </StandardFormLayout>
</template>
