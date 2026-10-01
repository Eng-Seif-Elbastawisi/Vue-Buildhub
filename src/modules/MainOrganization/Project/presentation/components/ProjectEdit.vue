<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import RadioButton from 'primevue/radiobutton';

import { dialogManager } from '@/base/Presentation/Dialogs/dialog.manager';

import type AddProjectParams from '../../core/params/add.project.params';
import EditProjectParams from '../../core/params/edit.project.params';
import ShowProjectParams from '../../core/params/show.project.params';

import ProjectController, { type ProjectNextStep } from '../controllers/project.controller';

import ProjectForm from './ProjectForm.vue';

const controller = ProjectController.getInstance();
const route = useRoute();
const { t } = useI18n();

const projectId = Number(route.params.project_id);

const params = ref<EditProjectParams | null>(null);
const loading = ref(false);


const nextStep = ref<ProjectNextStep>('preview');

const getWithPreviewValue = (): 0 | 1 => {
  return nextStep.value === 'preview' ? 1 : 0;
};

const updateData = (data: AddProjectParams) => {
  params.value = new EditProjectParams({
    projectId,
    translations: data.translations,
    client_exist: data.client_exist,
    client_id: data.client_id,
    client_name: data.client_name,
    client_phone: data.client_phone,
    client_source: data.client_source,

    project_type_id: data.project_type_id,
    location_id: data.location_id,
    service_type: data.service_type,

    date: data.date,
    notes: data.notes,

    attachments: data.attachments,

    engineer_id: data.engineer_id,
    preview_date: data.preview_date,
    preview_time: data.preview_time,
    site_link: data.site_link,
    address: data.address,

    terms: data.terms,

    /**
     * لا نأخذها من ProjectForm.
     * نحددها من اختيار المستخدم في هذه الصفحة.
     */
    with_preview: getWithPreviewValue(),
  });
};

const updateNextStep = (value: ProjectNextStep) => {
  nextStep.value = value;

  /**
   * تحديث الـ params الموجودة فور تغيير الاختيار.
   */
  if (params.value) {
    params.value.with_preview = getWithPreviewValue();
  }
};

const canSubmitProject = (): boolean => {
  if (!params.value) {
    dialogManager.toastWarning(t('Project.validation.cant_send_empty_data'));

    return false;
  }

  const validation = params.value.validate();

  if (!validation.isValid) {
    dialogManager.toastWarning(
      validation.errors[0]?.message || t('Project.validation.cant_send_empty_data'),
    );

    return false;
  }

  return true;
};

const saveProject = async (): Promise<void> => {
  if (!params.value) return;

  /**
   * تأكيد القيمة قبل الإرسال.
   */
  params.value.with_preview = getWithPreviewValue();

  if (!canSubmitProject()) return;

  loading.value = true;

  try {
    await controller.update(params.value, undefined, route.fullPath);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await controller.fetchOne(
    new ShowProjectParams({
      projectId,
      allLocales: true,
    }),
  );

  const project = controller.itemData.value as any;

  /**
   * ضبط الاختيار حسب القيمة الحالية للمشروع.
   */
  nextStep.value =
    project?.with_preview === true || Number(project?.with_preview) === 1 ? 'preview' : 'floor';
});
</script>

<template>
  <div class="Project-crud-page">
    <ProjectForm :Project="controller.itemData.value!" :loading="loading" :is-edit="true" @update-data="updateData" />

    <fieldset class="next-step-selector" :disabled="loading">
      <legend>
        {{ $t('Project.next_step') }}
      </legend>

      <div class="next-step-options">
        <label class="next-step-option" :class="{
          'next-step-option--selected': nextStep === 'preview',
        }" for="project-next-step-preview">
          <RadioButton :model-value="nextStep" input-id="project-next-step-preview" name="project-next-step"
            value="preview" @update:model-value="updateNextStep" />

          <span>
            {{ $t('Project.add_preview_first') }}
          </span>
        </label>

        <label class="next-step-option" :class="{
          'next-step-option--selected': nextStep === 'floor',
        }" for="project-next-step-floor">
          <RadioButton :model-value="nextStep" input-id="project-next-step-floor" name="project-next-step" value="floor"
            @update:model-value="updateNextStep" />

          <span>
            {{ $t('Project.continue_without_preview') }}
          </span>
        </label>
      </div>
    </fieldset>

    <button class="btn btn-primary" :class="{ 'btn--loading': loading }" type="button" :disabled="loading"
      @click="saveProject">
      {{ $t('Project.update') }}
    </button>

    <div v-if="controller.errorMessage.value" class="error">
      {{ controller.errorMessage.value }}
    </div>
  </div>
</template>

<style scoped>
.Project-crud-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.error {
  margin-top: 20px;
  padding: 10px;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  background-color: var(--danger-light);
  color: var(--danger-dark);
}

.btn-primary {
  width: 100%;
}

.next-step-selector {
  min-width: 0;
  margin: 0;
  padding: 1rem;
  border: 1px solid var(--border-weak);
  border-radius: 18px;
  background: var(--white);
}

.next-step-selector legend {
  padding-inline: 0.5rem;
  color: var(--gray-8);
  font-family: 'Bold';
}

.next-step-options {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.next-step-option {
  display: flex;
  min-height: 56px;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border: 1px solid var(--border-weak);
  border-radius: 14px;
  color: var(--gray-6);
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    color 0.2s ease;
}

.next-step-option:hover {
  border-color: var(--PrimaryColor);
  background: var(--PrimaryColor-light);
}

.next-step-option--selected {
  border-color: var(--PrimaryColor);
  background: var(--PrimaryColor-light);
  color: var(--PrimaryColor);
  font-family: 'Medium';
}

.next-step-selector:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

@media (max-width: 640px) {
  .next-step-options {
    grid-template-columns: 1fr;
  }
}
</style>
