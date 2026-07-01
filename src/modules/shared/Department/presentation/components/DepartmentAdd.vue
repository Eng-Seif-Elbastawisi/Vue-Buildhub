<script setup lang="ts">
  import { ref } from 'vue';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import DepartmentController from '../controllers/department.controller';
  import DepartmentForm from './DepartmentForm.vue';
  import type AddDepartmentParams from '../../core/params/add.department.params';
  import type DepartmentModel from '../../core/models/department.model';
  import EditDepartmentParams from '../../core/params/edit.department.params.ts';

  const controller = DepartmentController.getInstance();
  const params = ref<AddDepartmentParams | EditDepartmentParams | null>(null);
  const loading = ref(false);
  const props = defineProps<{ department?: DepartmentModel }>();
  const emit = defineEmits<{
    saved: [];
    cancel: [];
  }>();
  const resetKey = ref(0);

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
          ? await controller.update(paramsToSave, { useJson: true })
          : await controller.create(paramsToSave, { useJson: true });

      if (result) {
        emit('saved');
      }
    } catch (error) {
      console.error('Error saving email:', error);
    } finally {
      loading.value = false;
    }
  };

  const updateData = (value: AddDepartmentParams | EditDepartmentParams) => {
    params.value = value;
  };

  const cancelDepartment = () => {
    params.value = null;
    resetKey.value += 1;
    emit('cancel');
  };
</script>

<template>
  <section class="department-page">
    <DepartmentForm
      :loading="loading"
      :department="props.department"
      :reset-key="resetKey"
      @update-data="updateData"
    />
    <div class="actions">
      <AppButton class="btn-save" :title="$t('save')" type="button" @click="saveDepartment">{{
        $t('save')
      }}</AppButton>
      <AppButton
        v-if="props.department?.id"
        class="btn-cancel"
        theme="secondary"
        :title="$t('cancel')"
        type="button"
        @click="cancelDepartment"
      >
        {{ $t('cancel') }}
      </AppButton>
    </div>
    <div v-if="controller.errorMessage.value" class="error">
      {{ controller.errorMessage.value }}
    </div>
  </section>
</template>
<style scoped>
  .actions {
    padding: 0 0 20px 20px;
    display: flex;
    gap: 0.75rem;
  }

  .btn-save {
    flex: 1;
  }

  .btn-cancel {
    flex: 0 0 auto;
  }
</style>
