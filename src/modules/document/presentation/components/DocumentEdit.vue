<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';
  // import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import IconAccept from '@/shared/icons/IconAccept.vue';
  import DocumentController from '../controllers/document.controller';
  import DocumentForm from './DocumentForm.vue';
  import ShowDocumentParams from '../../core/params/show.document.params';
  import EditDocumentParams from '../../core/params/edit.document.params';
  import type AddDocumentParams from '../../core/params/add.document.params';

  const controller = DocumentController.getInstance();
  const route = useRoute();
  const formKey = route.fullPath;

  const params = ref<EditDocumentParams | null>(null);
  const loading = ref(false);

  const saveDocument = async () => {
  if (!params.value) return;
  loading.value = true;
  try {
    // ← حول الـ URLs لـ base64 قبل الإرسال
    const preparedParams = await EditDocumentParams.prepare(params.value);
    await controller.update(preparedParams, undefined, formKey);
  } finally {
    loading.value = false;
  }
};

  const updateData = (updatedParams: AddDocumentParams) => {
  params.value = new EditDocumentParams({
    document_id: Number(route.params.id),
    // refNumber: updatedParams.refNumber,
    subjects: updatedParams.subjects,
    stage_id: updatedParams.stage_id,
    tags: updatedParams.tags,
    // لو فاضي مبعتوش خالص
    images: updatedParams.images ? [updatedParams.images] : [],
    files: updatedParams.files ? [updatedParams.files] : [],
    translations: updatedParams.translations,
    documentTypeId: updatedParams.documentTypeId,
  });
};
 
  onMounted(async () => {
    await controller.fetchOne(
      new ShowDocumentParams({ document_id: Number(route.params.id), allLocales: true }),
    );
  }); 
</script>

<template>
  <div class="document-crud-example">
    <DocumentForm
      :document="controller.itemData.value!"
      :form-key="formKey"
      :loading="loading"
      @update-data="updateData"
    />

    <!-- <div class="actions" :class="{ disabled: loading }">
      <AppButton
        :title="$t('save_document')"
        size="sm"
        icon="right"
        type="submit"
        @click="saveDocument"
      >
        {{ $t('save_document') }}
        <template #icon>
          <IconAccept />
        </template>
      </AppButton>
    </div> -->
    <div class="actions" :class="{ disabled: loading }">
      <button  class="btn btn-primary w-full" type="submit" @click="saveDocument">
        <span v-if="loading" class="loader"></span> 
        <span v-else>
          {{ $t('save_document') }}  <IconAccept />
        </span>
      </button>
    </div>

    <div v-if="controller.errorMessage.value" class="error">
      {{ controller.errorMessage.value }}
    </div>
  </div>
</template>

<style scoped lang="scss">

  .loader {
    width: 35px;
    height: 35px;  
    border-radius: 50%;
    border: 8px solid;
    border-color: #000 #0000;
    animation: l1 1s infinite;
  }
  @keyframes l1 {to{transform: rotate(.5turn)}}
  @keyframes l7 {to{transform: rotate(.5turn)}}
  .email-crud-example {
    padding: 20px;
    margin: 0 auto;
  }

  .actions {
    &.disabled {
      cursor: not-allowed;
      pointer-events: none;
      opacity: 0.7;
    }
  }

  .error {
    margin-top: 20px;
    padding: 10px;
    background-color: var(--danger-light);
    color: var(--danger-dark);
    border: 1px solid #f5c6cb;
    border-radius: 4px;
  }
</style>
