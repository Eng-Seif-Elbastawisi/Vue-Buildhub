<script setup lang="ts">
  import ProjectIndex from '@/modules/MainOrganization/Project/presentation/components/ProjectIndex.vue';
  import { ConvertStatus } from '@/modules/MainOrganization/Project/core/constants/convert.status.enum';

  const pendingStatuses: ConvertStatus[] = [
    ConvertStatus.WAITING_PREVIEW,
    ConvertStatus.WAITING_PREVIEW_RESULT,
  ];
</script>
<template>
  <ProjectIndex :statuses="pendingStatuses" />
</template>
