<script setup lang="ts">
  import { useRoute } from 'vue-router';
  import ProjectManagementShortcut from '../../../Schedule/presentation/components/ProjectManagementShortcut.vue';
  import { workItemsPath } from '../work-items.routes';
  defineProps<{ quoteId: number }>();
  const route = useRoute();
</script>
<template>
  <ProjectManagementShortcut
    :title="$t('work_items.title')"
    :description="$t('work_items.subtitle')"
    :open-label="$t('work_items.open')"
    icon="pi pi-list-check"
    :to="workItemsPath(route.path, quoteId)"
    :metrics="[]"
    state="available"
  />
</template>
