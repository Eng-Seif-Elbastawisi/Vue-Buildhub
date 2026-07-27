<script setup lang="ts">
import TaskAssignmentShow from '@/modules/MainOrganization/TaskAssignment/presentation/components/TaskAssignmentsShow.vue';

const props = defineProps<{
  id: string;
  uuid: string;
}>();
</script>

<template>
  <TaskAssignmentShow v-bind="props" />
</template>
