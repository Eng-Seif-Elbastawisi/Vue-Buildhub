<script setup lang="ts">
  import StandardFormLayout from '@/shared/components/form/StandardFormLayout.vue';
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
  <StandardFormLayout mode="create" class="Project-crud-page">
    <ProjectSteps :current-step="1" />

    <ProjectForm
      ref="projectForm"
      :loading="loading"
      :is-edit="false"
      @update-data="params = $event"
    />

    <fieldset
      class="next-step-selector"
      aria-labelledby="project-next-step-title"
      :disabled="loading"
    >
      <h2 id="project-next-step-title" class="next-step-title">
        {{ $t('Project.next_step') }}
      </h2>

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

    <div v-if="controller.errorMessage.value" class="error">
      {{ controller.errorMessage.value }}
    </div>

    <template #actions>
      <button
        class="btn btn-primary"
        :class="{ 'btn--loading': loading }"
        type="button"
        :disabled="loading"
        @click="saveProject"
      >
        {{ $t('Project.save') }}
      </button>
    </template>
  </StandardFormLayout>
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
  border: 1px solid var(--bh-coral-soft);
  border-radius: 4px;
  background-color: var(--danger-light);
  color: var(--danger-dark);
}

.btn-primary {
  width: 100%;
}

.next-step-selector {
  min-width: 0;
  margin-block: 0.25rem;
  padding: 1.25rem;
  border: 1px solid var(--border-weak);
  border-radius: var(--bh-radius-control);
  background: var(--bh-surface-raised);
}

.next-step-title {
  margin: 0 0 0.25rem;
  color: var(--gray-8);
  font-family: 'Bold';
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.4;
  text-align: start;
}

.next-step-options {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.875rem;
  margin-block-start: 0.5rem;
}

.next-step-option {
  display: flex;
  min-height: 64px;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.125rem;
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
