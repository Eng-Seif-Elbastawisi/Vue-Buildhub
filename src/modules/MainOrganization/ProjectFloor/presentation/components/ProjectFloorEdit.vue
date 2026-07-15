<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useRoute } from 'vue-router';

  import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import { dialogManager } from '@/base/Presentation/Dialogs/dialog.manager';
  import type { FieldError } from '@/base/Presentation/Utils/classValidation';

  import type ProjectFloorShowModel from '../../core/models/project.floor.show.model.ts';
  import type AddProjectFloorParams from '../../core/params/add.project.floor.params.ts';
  import EditProjectFloorParams from '../../core/params/edit.project.floor.params.ts';
  import ShowProjectFloorParams from '../../core/params/show.project.floor.params.ts';
  import ProjectFloorController from '../controllers/project.floor.controller.ts';
  import ProjectFloorForm from './ProjectFloorForm.vue';

  const controller = ProjectFloorController.getInstance();
  const route = useRoute();
  const { t } = useI18n();

  const toPositiveInteger = (value: unknown): number | undefined => {
    const normalizedValue = Array.isArray(value) ? value[0] : value;
    const numberValue = Number(normalizedValue);

    return Number.isInteger(numberValue) && numberValue > 0 ? numberValue : undefined;
  };

  const projectFloorId = computed(() => toPositiveInteger(route.params.project_floor_id));
  const routeProjectId = computed(() => toPositiveInteger(route.query.project_id));
  const routeProjectPreviewId = computed(() => toPositiveInteger(route.query.project_preview_id));
  const projectFloor = ref<ProjectFloorShowModel | null>(null);
  const params = ref<EditProjectFloorParams | null>(null);
  const initialLoading = ref(true);
  const saving = ref(false);
  const loadError = ref<string | null>(null);
  const validationErrors = ref<Record<string, string>>({});

  const projectId = computed(
    () => projectFloor.value?.project_id ?? projectFloor.value?.project?.id ?? routeProjectId.value,
  );
  const projectPreviewId = computed(
    () =>
      projectFloor.value?.project_preview_id ??
      projectFloor.value?.project_preview?.id ??
      routeProjectPreviewId.value,
  );

  const updateData = (data: AddProjectFloorParams) => {
    params.value = new EditProjectFloorParams({
      id: projectFloorId.value ?? 0,
      project_id: data.project_id || projectId.value || 0,
      project_preview_id: data.project_preview_id || projectPreviewId.value || 0,
      floor_number: data.floor_number,
      site_description: data.site_description,
      technical_general_notes: data.technical_general_notes,
      inspection_recommendations: data.inspection_recommendations,
      spaces: data.spaces,
    });

    validationErrors.value = {};
  };

  const mapValidationErrors = (errors: FieldError[]): Record<string, string> => {
    return Object.fromEntries(errors.map((error) => [error.field, error.message]));
  };

  const mapServerValidationErrors = (errors?: Record<string, string[]>): Record<string, string> => {
    if (!errors) return {};

    return Object.fromEntries(
      Object.entries(errors).map(([field, messages]) => [field, messages[0] ?? '']),
    );
  };

  const getValidatedParams = (): EditProjectFloorParams | null => {
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

  const saveProjectFloor = async () => {
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

  const fetchProjectFloor = async () => {
    const id = projectFloorId.value;

    initialLoading.value = true;
    loadError.value = null;
    projectFloor.value = null;
    params.value = null;

    if (!id) {
      loadError.value = t('failed_to_load_data');
      initialLoading.value = false;
      return;
    }

    try {
      const result = await controller.fetchOne(
        new ShowProjectFloorParams({
          project_floor_id: id,
          project_id: routeProjectId.value,
          project_preview_id: routeProjectPreviewId.value,
          allLocales: true,
        }),
      );

      if (result instanceof DataSuccess && result.data) {
        projectFloor.value = result.data;
        return;
      }

      loadError.value = result.error?.displayMessage || t('failed_to_load_data');
    } catch {
      loadError.value = controller.errorMessage.value || t('failed_to_load_data');
    } finally {
      initialLoading.value = false;
    }
  };

  onMounted(fetchProjectFloor);
</script>

<template>
  <div class="ProjectFloor-crud-page">
    <div v-if="initialLoading" class="project-floor-state" aria-busy="true">
      {{ $t('loading') }}
    </div>

    <div v-else-if="loadError" class="project-floor-state project-floor-state--error">
      <span>{{ loadError }}</span>
      <button class="btn btn-primary" type="button" @click="fetchProjectFloor">
        {{ $t('organization_toggle.retry') }}
      </button>
    </div>

    <template v-else-if="projectFloor">
      <ProjectFloorForm
        :project-floor="projectFloor"
        :project-id="projectId"
        :project-preview-id="projectPreviewId"
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
        @click="saveProjectFloor"
      >
        {{ $t('ProjectFloor.update') }}
      </button>
      <div v-if="controller.errorMessage.value" class="error">
        {{ controller.errorMessage.value }}
      </div>
    </template>

    <div v-else class="project-floor-state project-floor-state--error">
      {{ $t('no_data') }}
    </div>
  </div>
</template>

<style scoped>
  .ProjectFloor-crud-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .project-floor-state {
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

  .project-floor-state--error {
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
