<script setup lang="ts">
  import { ref } from 'vue';
  import { useRoute } from 'vue-router';
  import EducationClassificationController from '../controllers/educationClassification.controller';
  import type AddEducationClassificationParams from '../../core/params/add.educationClassification.params';
  import EducationClassificationForm from './EducationClassificationForm.vue';
  // import type Params from '@/base/Core/Params/params.ts';
  // Controller instance
  const controller = EducationClassificationController.getInstance();
  const route = useRoute();
  const formKey = route.fullPath;
  // Form state
  const params = ref<AddEducationClassificationParams | null>(null);
  const loading = ref(false);
  /**
   * Save (create or update) email
   */
  const saveEducationClassification = async () => {
    if (!params.value) {
      console.error('No email parameters to save');
      return;
    }
    loading.value = true;
    try {
      const paramsToSave = params.value;
      await controller.create(paramsToSave, undefined, formKey);
      // await controller.fetchList();
      // await controller.fetchList({} as Params);
    } catch (error) {
      console.error('Error saving email:', error);
    } finally {
      loading.value = false;
    }
  };

  const updateData = (updatedParams: AddEducationClassificationParams) => {
    params.value = updatedParams;
    // saveEmail();
  };
</script>

<template>
  <EducationClassificationForm
    :form-key="formKey"
    :country="controller.itemData.value || undefined"
    :loading="loading"
    @update-data="updateData"
    @save-education-classification="saveEducationClassification"
  />
</template>

<style scoped>
  :deep(.input-file) {
    border: 1px solid var(--gray-200-std) !important;
    padding: 11px;
    border-radius: 20px !important;
    cursor: pointer;
  }
</style>
