<script setup lang="ts">
  import AttachmentTypeEdit from '@/modules/MainOrganization/AttachmentType/presentation/components/AttachmentTypeEdit.vue';

  defineProps<{
    id?: string | number;
  }>();
</script>

<template>
  <AttachmentTypeEdit :id="id" class="standard-crud-page" />
</template>
