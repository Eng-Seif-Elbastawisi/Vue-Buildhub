<script setup lang="ts">
  import { ref } from 'vue';
  import { useRoute } from 'vue-router';
  import type AddInvoiceParams from '../../core/params/add.invoice.params';
  import InvoiceController from '../controllers/invoice.controller';
  import InvoiceForm from './InvoiceForm.vue';

  const controller = InvoiceController.getInstance();
  controller.reset();

  const route = useRoute();
  const formKey = route.fullPath;
  const params = ref<AddInvoiceParams | null>(null);
  const loading = ref(false);

  const saveInvoice = async () => {
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
  <div class="invoice-crud-page">
    <InvoiceForm
      enable-grouping
      :form-key="formKey"
      :loading="loading"
      @update-data="params = $event"
      @submit="saveInvoice"
    />

    <div v-if="controller.errorMessage.value" class="invoice-error" aria-live="polite">
      {{ controller.errorMessage.value }}
    </div>
  </div>
</template>
