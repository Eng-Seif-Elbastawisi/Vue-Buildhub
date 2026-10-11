<script setup lang="ts">
  import { useRouter } from 'vue-router';
  import SchedulePage from './SchedulePage.vue';
  import ScheduleGroupForm from './ScheduleGroupForm.vue';
  const router = useRouter();
</script>
<template>
  <SchedulePage mode="add">
    <template #default="{ quoteId, indexRoute, formKey, saved }">
      <ScheduleGroupForm
        :key="formKey"
        :quote-id="quoteId"
        @cancel="router.push(indexRoute)"
        @saved="saved"
      />
    </template>
  </SchedulePage>
</template>
