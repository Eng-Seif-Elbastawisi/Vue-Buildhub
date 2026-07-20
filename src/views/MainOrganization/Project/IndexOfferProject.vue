<script setup lang="ts">
  import ProjectIndex from '@/modules/MainOrganization/Project/presentation/components/ProjectIndex.vue';
  import { ConvertStatus } from '@/modules/MainOrganization/Project/core/constants/convert.status.enum';

  const projectStatuses: ConvertStatus[] = [
    ConvertStatus.SEND_TO_CLIENT,
    ConvertStatus.REJECT_CLIENT,
    ConvertStatus.WAITING_PRICING,
  ];
</script>

<template>
  <ProjectIndex :statuses="projectStatuses" />
</template>
