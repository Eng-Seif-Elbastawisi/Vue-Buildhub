<script setup lang="ts">
  import { useRoute } from 'vue-router';
  import ProjectManagementShortcut from '../../../Schedule/presentation/components/ProjectManagementShortcut.vue';
  import { materialReceiptPath } from '../material-receipt.routes';
  defineProps<{ quoteId: number }>();
  const route = useRoute();
</script>
<template>
  <ProjectManagementShortcut
    :title="$t('material_receipt.warehouse')"
    :description="$t('material_disbursement.warehouse_subtitle')"
    :open-label="$t('material_disbursement.open_warehouse')"
    icon="pi pi-box"
    :to="materialReceiptPath(route.path, quoteId)"
    :metrics="[]"
    state="available"
  />
</template>
