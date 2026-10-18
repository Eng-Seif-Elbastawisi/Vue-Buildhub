<script setup lang="ts">
  import StandardFormLayout from '@/shared/components/form/StandardFormLayout.vue';
  import { ref } from 'vue';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import StandardFormSectionHeader from '@/shared/components/form/StandardFormSectionHeader.vue';
  import DepartmentController from '../controllers/department.controller';
  import DepartmentForm from './DepartmentForm.vue';
  import type AddDepartmentParams from '../../core/params/add.department.params';
  import type DepartmentModel from '../../core/models/department.model';
  import EditDepartmentParams from '../../core/params/edit.department.params.ts';
  import type { DepartmentTypeEnum } from '../../core/constants/Type.enum';

  const controller = DepartmentController.getInstance();
  controller.resetItem();
  const params = ref<AddDepartmentParams | EditDepartmentParams | null>(null);
  const loading = ref(false);
  const props = defineProps<{ department?: DepartmentModel; type?: DepartmentTypeEnum }>();
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
  <StandardFormLayout as="section" mode="create" class="department-inline-form">
    <StandardFormSectionHeader :title="$t('department')" icon="pi pi-sitemap" />
    <DepartmentForm
      :loading="loading"
      :department="props.department"
      :type="props.type"
      :reset-key="resetKey"
      @update-data="updateData"
    />

    <div v-if="controller.errorMessage.value" class="error">
      {{ controller.errorMessage.value }}
    </div>

    <template #actions>
      <div class="actions">
        <AppButton
          :loading="loading"
          class="btn-save"
          :title="$t('save')"
          type="button"
          @click="saveDepartment"
          >{{ $t('save') }}</AppButton
        >
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
    </template>
  </StandardFormLayout>
</template>
<style scoped>
.department-inline-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
  width: 100%;
  min-width: 0;
  margin-block: var(--page-section-gap);
  padding: var(--surface-padding);
  border: 1px solid var(--border-weak);
  border-radius: var(--card-radius);
  background-color: var(--bg-card);
  box-shadow: none;
}

.department-inline-form :deep(.standard-form-section-header) {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  padding-block-end: 16px;
  border-bottom: 1px solid var(--border-weak);
}

.department-inline-form :deep(.standard-form-section-header__icon) {
  display: grid;
  flex: 0 0 36px;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: var(--control-radius);
  background-color: var(--quote-copper-soft);
  color: var(--quote-copper);
}

.department-inline-form :deep(.standard-form-section-header h2) {
  margin: 0;
  font-size: 1.05rem;
}

.department-inline-form :deep(.form-fields) {
  padding: 0;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-block-start: 16px;
  border-top: 1px solid var(--border-weak);
}

.btn-save {
  flex: 0 0 auto;
}

.btn-cancel {
  flex: 0 0 auto;
}

.error {
  margin-top: 20px;
  padding: 10px;
  background-color: var(--danger-light);
  color: var(--danger-dark);
  border: 1px solid var(--bh-coral-soft);
  border-radius: 4px;
}

@media (max-width: 767px) {
  .department-inline-form {
    padding: 18px;
  }

  .actions {
    flex-direction: column-reverse;
  }

  .actions :deep(.btn) {
    width: 100%;
  }
}
</style>
