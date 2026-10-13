<script setup lang="ts">
  import { useRoute } from 'vue-router';
  import ProjectManagementShortcut from '../../../Schedule/presentation/components/ProjectManagementShortcut.vue';
  import { procurementPath } from '../procurement.routes';
  defineProps<{ quoteId: number }>();
  const route = useRoute();
</script>
<template>
  <ProjectManagementShortcut
    :title="$t('procurement.title')"
    :description="$t('procurement.subtitle')"
    :open-label="$t('procurement.open')"
    icon="pi pi-shopping-cart"
    :to="procurementPath(route.path, quoteId)"
    :metrics="[]"
    state="available"
  />
</template>
