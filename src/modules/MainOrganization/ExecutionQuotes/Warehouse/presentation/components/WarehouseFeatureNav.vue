<script setup lang="ts">
  import { materialReceiptPath } from '../material-receipt.routes';
  import { materialDisbursementPath } from '../material-disbursement.routes';

  defineProps<{
    quoteId: number;
    currentPath: string;
    active: 'receipt' | 'disbursement';
  }>();
</script>
<template>
  <nav class="warehouse-feature-nav" :aria-label="$t('material_disbursement.warehouse_features')">
    <RouterLink
      :to="materialReceiptPath(currentPath, quoteId)"
      :aria-current="active === 'receipt' ? 'page' : undefined"
      ><i class="pi pi-download" aria-hidden="true" />{{ $t('material_receipt.title') }}</RouterLink
    >
    <RouterLink
      :to="materialDisbursementPath(currentPath, quoteId)"
      :aria-current="active === 'disbursement' ? 'page' : undefined"
      ><i class="pi pi-upload" aria-hidden="true" />{{
        $t('material_disbursement.title')
      }}</RouterLink
    >
  </nav>
</template>
