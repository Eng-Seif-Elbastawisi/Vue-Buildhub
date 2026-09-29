<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import EditAttachmentTypeParams from '../../core/params/edit.attachment.type.params';
import ShowAttachmentTypeParams from '../../core/params/show.attachment.type.params';
import AttachmentTypeController from '../controllers/attachment.type.controller';
import AttachmentTypeForm from './AttachmentTypeForm.vue';
import type AddAttachmentTypeParams from '../../core/params/add.attachment.type.params';

const controller = AttachmentTypeController.getInstance();
const route = useRoute();
const attachmentTypeId = Number(route.params.id);
const params = ref<EditAttachmentTypeParams | null>(null);
const loading = ref(false);

const updateData = (data: AddAttachmentTypeParams) => {
  params.value = new EditAttachmentTypeParams({
    id: attachmentTypeId,
    translations: data.translations,
  });
};

const saveAttachmentType = async () => {
  if (!params.value) return;

  const validation = params.value.validate();
  if (!validation.isValid) {
    params.value.validateOrThrow();
    return;
  }

  loading.value = true;
  try {
    await controller.update(params.value, undefined, route.fullPath);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await controller.fetchOne(new ShowAttachmentTypeParams(attachmentTypeId, true));
});
</script>

<template>
  <div class="attachment-type-crud-page">
  <!-- <pre>
    {{ controller.itemData.value }}
  </pre> -->
    <AttachmentTypeForm
      :attachment-type="controller.itemData.value!"
      :loading="loading"
      is-edit
      @update-data="updateData"
    />
    <button
      :class="{ 'btn--loading': loading }"
      class="btn btn-primary"
      type="button"
      :disabled="loading"
      @click="saveAttachmentType"
    >
      {{ $t('save') }}
    </button>
  </div>
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
