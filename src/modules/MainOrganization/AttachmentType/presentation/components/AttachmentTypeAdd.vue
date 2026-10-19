<script setup lang="ts">
  import StandardFormLayout from '@/shared/components/form/StandardFormLayout.vue';
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import AttachmentTypeController from '../controllers/attachment.type.controller';
import AttachmentTypeForm from './AttachmentTypeForm.vue';
import type AddAttachmentTypeParams from '../../core/params/add.attachment.type.params';

const controller = AttachmentTypeController.getInstance();
const route = useRoute();
const params = ref<AddAttachmentTypeParams | null>(null);
const loading = ref(false);

const saveAttachmentType = async () => {
  if (!params.value) return;

  const validation = params.value.validate();
  if (!validation.isValid) {
    params.value.validateOrThrow();
    return;
  }

  loading.value = true;
  try {
    await controller.create(params.value, undefined, route.fullPath);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <StandardFormLayout mode="create" class="attachment-type-crud-page">
    <AttachmentTypeForm :loading="loading" @update-data="params = $event" />

    <template #actions>
      <button
        :class="{ 'btn--loading': loading }"
        class="btn btn-primary"
        type="button"
        :disabled="loading"
        @click="saveAttachmentType"
      >
        {{ $t('save') }}
      </button>
    </template>
  </StandardFormLayout>
</template>

<style scoped>
.attachment-type-crud-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.btn-primary {
  width: 100%;
}
</style>
