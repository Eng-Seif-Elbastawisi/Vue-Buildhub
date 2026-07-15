<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useRoute } from 'vue-router';

  import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import { dialogManager } from '@/base/Presentation/Dialogs/dialog.manager';
  import type { FieldError } from '@/base/Presentation/Utils/classValidation';

  import type ProjectPreviewShowModel from '../../../core/models/project.preview.show.model.ts';
  import type AddProjectPreviewParams from '../../../core/params/add.project.preview.params.ts';
  import EditProjectPreviewParams from '../../../core/params/edit.project.preview.params.ts';
  import ShowProjectPreviewParams from '../../../core/params/show.project.preview.params.ts';
  import ProjectPreviewController from '../../controllers/project.preview.controller.ts';
  import ProjectPreviewForm from '../project_preview/ProjectPreviewForm.vue';

  const controller = ProjectPreviewController.getInstance();
  const route = useRoute();
  const { t } = useI18n();

  const toPositiveInteger = (value: unknown): number | undefined => {
    const normalizedValue = Array.isArray(value) ? value[0] : value;
    const numberValue = Number(normalizedValue);

    return Number.isInteger(numberValue) && numberValue > 0 ? numberValue : undefined;
  };

  const previewId = computed(() => toPositiveInteger(route.params.project_preview_id));
  const routeProjectId = computed(() => toPositiveInteger(route.query.project_id));
  const projectPreview = ref<ProjectPreviewShowModel | null>(null);
  const params = ref<EditProjectPreviewParams | null>(null);
  const initialLoading = ref(true);
  const saving = ref(false);
  const loadError = ref<string | null>(null);
  const validationErrors = ref<Record<string, string>>({});

  const projectId = computed(() => projectPreview.value?.project_id ?? routeProjectId.value);

  const updateData = (data: AddProjectPreviewParams) => {
    params.value = new EditProjectPreviewParams({
      id: previewId.value,
      project_id: data.project_id ?? projectId.value,
      engineer_id: data.engineer_id,
      preview_date: data.preview_date,
      preview_time: data.preview_time,
      site_link: data.site_link,
      address: data.address,
      notification_type: data.notification_type,
      status: data.status,
      pricing_responsible_id: data.pricing_responsible_id,
      notification_message: data.notification_message,
    });

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

  const getValidatedParams = (): EditProjectPreviewParams | null => {
    if (!params.value) {
      dialogManager.toastWarning(t('Project.validation.cant_send_empty_data'));
      return null;
    }

    const validation = params.value.validate();
    validationErrors.value = mapValidationErrors(validation.errors);

    if (!validation.isValid) {
      dialogManager.toastWarning(
        validation.errors[0]?.message || t('Project.validation.cant_send_empty_data'),
      );
      return null;
    }

    return params.value;
  };

  const saveProject = async () => {
    if (saving.value) return;

    const requestParams = getValidatedParams();
    if (!requestParams) return;

    saving.value = true;

    try {
      const result = await controller.update(requestParams, undefined, route.fullPath);

      if (result?.hasError) {
        validationErrors.value = mapServerValidationErrors(result.error?.validationErrors);
      }
    } finally {
      saving.value = false;
    }
  };

  const fetchProjectPreview = async () => {
    const id = previewId.value;

    initialLoading.value = true;
    loadError.value = null;
    projectPreview.value = null;
    params.value = null;

    if (!id) {
      loadError.value = t('failed_to_load_data');
      initialLoading.value = false;
      return;
    }

    try {
      const result = await controller.fetchOne(new ShowProjectPreviewParams({ previewId: id }));

      if (result instanceof DataSuccess && result.data) {
        projectPreview.value = result.data;
        return;
      }

      loadError.value = result.error?.displayMessage || t('failed_to_load_data');
    } catch {
      loadError.value = controller.errorMessage.value || t('failed_to_load_data');
    } finally {
      initialLoading.value = false;
    }
  };

  onMounted(fetchProjectPreview);
</script>

<template>
  <div class="ProjectPreviewEdit-crud-page">
    <div v-if="initialLoading" class="project-preview-state" aria-busy="true">
      {{ $t('loading') }}
    </div>

    <div v-else-if="loadError" class="project-preview-state project-preview-state--error">
      <span>{{ loadError }}</span>
      <button class="btn btn-primary" type="button" @click="fetchProjectPreview">
        {{ $t('organization_toggle.retry') }}
      </button>
    </div>

    <template v-else-if="projectPreview">
      <ProjectPreviewForm
        :project-preview="projectPreview"
        :project-id="projectId"
        :loading="saving"
        :is-edit="true"
        :validation-errors="validationErrors"
        @update-data="updateData"
      />
      <button
        :class="{ 'btn--loading': saving }"
        class="btn btn-primary"
        type="button"
        :disabled="saving"
        @click="saveProject"
      >
        {{ $t('Project.update') }}
      </button>
      <div v-if="controller.errorMessage.value" class="error">
        {{ controller.errorMessage.value }}
      </div>
    </template>

    <div v-else class="project-preview-state project-preview-state--error">
      {{ $t('no_data') }}
    </div>
  </div>
</template>

<style scoped>
  .ProjectPreviewEdit-crud-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .project-preview-state {
    display: flex;
    min-height: 160px;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 1.5rem;
    border: 1px solid var(--border-weak);
    border-radius: 12px;
    background: var(--white);
    color: var(--gray-700);
  }

  .project-preview-state--error {
    flex-direction: column;
    color: var(--danger-dark);
  }

  .error {
    margin-top: 20px;
    padding: 10px;
    background-color: var(--danger-light);
    color: var(--danger-dark);
    border: 1px solid #f5c6cb;
    border-radius: 4px;
  }

  .btn-primary {
    width: 100%;
  }
</style>
