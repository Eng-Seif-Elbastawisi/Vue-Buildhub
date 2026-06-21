<script setup lang="ts">
  import { ref } from 'vue';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import DepartmentController from '../controllers/department.controller';
  import DepartmentForm from './DepartmentForm.vue';
  import type AddDepartmentParams from '../../core/params/add.department.params';
  import type DepartmentModel from '../../core/models/department.model';
  import EditDepartmentParams from '../../core/params/edit.department.params.ts';

  const controller = DepartmentController.getInstance();
  const params = ref<AddDepartmentParams | null>(null);
  const loading = ref(false);
  const { department } = defineProps<{ department?: DepartmentModel }>();
  const emit = defineEmits(['saved']);

  const saveDepartment = async () => {
    loading.value = true;
    try {
      if (!params.value) {
        console.error('No department parameters to save');
        return;
      }

      const paramsToSave = params.value;

      const result =
        paramsToSave instanceof EditDepartmentParams
          ? await controller.update(paramsToSave, undefined)
          : await controller.create(paramsToSave, undefined);

      if (result) {
        emit('saved');
      }
    } catch (error) {
      console.error('Error saving email:', error);
    } finally {
      loading.value = false;
    }
  };
</script>

<template>
  <section class="department-page">
    <DepartmentForm
      :loading="loading"
      :department="department"
      @update-data="(value) => (params = value as AddDepartmentParams)"
    />
    <div class="actions">
      <AppButton :title="$t('save')" type="button" @click="saveDepartment">{{
        $t('save')
      }}</AppButton>
    </div>
    <div v-if="controller.errorMessage.value" class="error">
      {{ controller.errorMessage.value }}
    </div>
  </section>
</template>
<style scoped>
  .actions {
    padding: 0 0 20px 20px;
  }
</style>
