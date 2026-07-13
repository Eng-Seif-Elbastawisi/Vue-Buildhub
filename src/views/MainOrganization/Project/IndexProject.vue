<script setup lang="ts">
  import ProjectIndex from '@/modules/MainOrganization/Project/presentation/components/ProjectIndex.vue';
  import { ConvertStatus } from '@/modules/MainOrganization/Project/core/constants/convert.status.enum';

  const pendingStatuses: ConvertStatus[] = [ConvertStatus.PENDING];
</script>
<template>
  <ProjectIndex :statuses="pendingStatuses" />
</template>
