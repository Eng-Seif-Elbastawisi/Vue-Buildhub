<script setup lang="ts">
  import { ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useRoute } from 'vue-router';

  import RadioButton from 'primevue/radiobutton';

  import { dialogManager } from '@/base/Presentation/Dialogs/dialog.manager';

  import type AddProjectParams from '../../core/params/add.project.params';
  import ProjectController, { type ProjectNextStep } from '../controllers/project.controller';

  import ProjectForm from './ProjectForm.vue';
  import ProjectSteps from './ProjectSteps.vue';

  const controller = ProjectController.getInstance();

  const route = useRoute();

  const { t } = useI18n();

  const params = ref<AddProjectParams | null>(null);

  const projectForm = ref<{ scrollToValidationField: (field: string) => void } | null>(null);

  const loading = ref(false);

  const nextStep = ref<ProjectNextStep>('preview');

  const canSubmitProject = (): boolean => {
    if (!params.value) {
      dialogManager.toastWarning(t('Project.validation.cant_send_empty_data'));

      return false;
    }

    const validation = params.value.validate();

    if (!validation.isValid) {
      const firstInvalidField = validation.errors[0]?.field;

      if (firstInvalidField) {
        projectForm.value?.scrollToValidationField(firstInvalidField);
      }

      dialogManager.toastWarning(
        validation.errors[0]?.message || t('Project.validation.cant_send_empty_data'),
      );

      return false;
    }

    return true;
  };

  const saveProject = async (): Promise<void> => {
    if (!params.value) return;

    params.value.with_preview = nextStep.value === 'preview' ? 1 : 0;

    if (!canSubmitProject()) return;

    loading.value = true;

    try {
      await controller.create(params.value, undefined, route.fullPath, nextStep.value);
    } finally {
      loading.value = false;
    }
  };
</script>

<template>
  <div class="Project-crud-page">
    <ProjectSteps :current-step="1" />

    <ProjectForm
      ref="projectForm"
      :loading="loading"
      :is-edit="false"
      @update-data="params = $event"
    />

    <fieldset class="next-step-selector" :disabled="loading">
      <legend>
        {{ $t('Project.next_step') }}
      </legend>

      <div class="next-step-options">
        <label
          class="next-step-option"
          :class="{
            'next-step-option--selected': nextStep === 'preview',
          }"
          for="project-next-step-preview"
        >
          <RadioButton
            v-model="nextStep"
            input-id="project-next-step-preview"
            name="project-next-step"
            value="preview"
          />

          <span>
            {{ $t('Project.add_preview_first') }}
          </span>
        </label>

        <label
          class="next-step-option"
          :class="{
            'next-step-option--selected': nextStep === 'floor',
          }"
          for="project-next-step-floor"
        >
          <RadioButton
            v-model="nextStep"
            input-id="project-next-step-floor"
            name="project-next-step"
            value="floor"
          />

          <span>
            {{ $t('Project.continue_without_preview') }}
          </span>
        </label>
      </div>
    </fieldset>

    <button
      class="btn btn-primary"
      :class="{ 'btn--loading': loading }"
      type="button"
      :disabled="loading"
      @click="saveProject"
    >
      {{ $t('Project.save') }}
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
