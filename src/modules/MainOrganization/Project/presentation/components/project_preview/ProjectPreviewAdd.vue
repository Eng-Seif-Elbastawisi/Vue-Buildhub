<script setup lang="ts">
  import StandardFormLayout from '@/shared/components/form/StandardFormLayout.vue';
  import { computed, ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useRoute } from 'vue-router';

  import { dialogManager } from '@/base/Presentation/Dialogs/dialog.manager';
  import type { FieldError } from '@/base/Presentation/Utils/classValidation';

  import AddProjectPreviewParams from '../../../core/params/add.project.preview.params';
  import ProjectPreviewController from '../../controllers/project.preview.controller';
  import ProjectPreviewForm from '../project_preview/ProjectPreviewForm.vue';
  import ProjectSteps from '../ProjectSteps.vue';

  const controller = ProjectPreviewController.getInstance();
  const route = useRoute();
  const { t } = useI18n();

  const params = ref<AddProjectPreviewParams | null>(null);
  const loading = ref(false);
  const validationErrors = ref<Record<string, string>>({});

  const projectId = computed(() => Number(route.params.id || route.query.project_id));

  const withProjectId = (value: AddProjectPreviewParams) => {
    return new AddProjectPreviewParams({
      project_id: projectId.value,
      engineer_id: value.engineer_id,
      preview_date: value.preview_date,
      preview_time: value.preview_time,
      site_link: value.site_link,
      address: value.address,
      notification_type: value.notification_type,
      status: value.status,
      pricing_responsible_id: value.pricing_responsible_id,
      notification_message: value.notification_message,
    });
  };

  const updateData = (value: AddProjectPreviewParams) => {
    params.value = withProjectId(value);
    validationErrors.value = {};
  };

  const mapValidationErrors = (errors: FieldError[]) => {
    return Object.fromEntries(errors.map((error) => [error.field, error.message]));
  };

  const mapServerValidationErrors = (errors?: Record<string, string[]>) => {
    if (!errors) return {};

    return Object.fromEntries(
      Object.entries(errors).map(([field, messages]) => [field, messages[0] ?? '']),
    );
  };

  const getValidatedParams = (): AddProjectPreviewParams | null => {
    if (!params.value || !Number.isInteger(projectId.value) || projectId.value <= 0) {
      dialogManager.toastWarning(t('Project.validation.cant_send_empty_data'));
      return null;
    }

    const requestParams = withProjectId(params.value);
    const validation = requestParams.validate();

    validationErrors.value = mapValidationErrors(validation.errors);

    if (!validation.isValid) {
      dialogManager.toastWarning(
        validation.errors[0]?.message || t('Project.validation.cant_send_empty_data'),
      );
      return null;
    }

    return requestParams;
  };

  const saveProjectPreview = async () => {
    if (loading.value) return;

    const requestParams = getValidatedParams();
    if (!requestParams) return;

    loading.value = true;

    try {
      const result = await controller.create(requestParams, undefined, route.fullPath);

      if (result?.hasError) {
        validationErrors.value = mapServerValidationErrors(result.error?.validationErrors);
      }
    } finally {
      loading.value = false;
    }
  };
</script>

<template>
  <StandardFormLayout mode="create" class="ProjectPreviewAdd-crud-page">
    <ProjectSteps :current-step="2" />
    <ProjectPreviewForm
      :loading="loading"
      :project-id="projectId"
      :validation-errors="validationErrors"
      @update-data="updateData"
    />

    <div v-if="controller.errorMessage.value" class="error">
      {{ controller.errorMessage.value }}
    </div>

    <template #actions>
      <button
        :class="{ 'btn--loading': loading }"
        class="btn btn-primary"
        type="button"
        :disabled="loading || !projectId"
        @click="saveProjectPreview"
      >
        {{ $t('Project.save') }}
      </button>
    </template>
  </StandardFormLayout>
</template>

<style scoped>
.ProjectPreviewAdd-crud-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.error {
  margin-top: 20px;
  padding: 10px;
  background-color: var(--danger-light);
  color: var(--danger-dark);
  border: 1px solid var(--bh-coral-soft);
  border-radius: 4px;
}

.btn-primary {
  width: 100%;
}
</style>
