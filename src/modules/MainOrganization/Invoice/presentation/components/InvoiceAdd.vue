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
    <InvoiceForm :form-key="formKey" :loading="loading" @update-data="params = $event" />

    <div class="invoice-actions" :class="{ disabled: loading }">
      <button
        class="btn btn-primary w-full"
        type="button"
        :class="{ 'btn--loading': loading }"
        :disabled="loading"
        @click="saveInvoice"
      >
        <span v-if="loading" class="loader"></span>
        <span v-else>{{ $t('invoice.save') }}</span>
      </button>
    </div>

    <div v-if="controller.errorMessage.value" class="invoice-error">
      {{ controller.errorMessage.value }}
    </div>
  </div>
</template>

<!-- <style lang="scss">
  @use '../styles/invoice';
</style> -->
