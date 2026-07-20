<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useRoute } from 'vue-router';

  import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import { dialogManager } from '@/base/Presentation/Dialogs/dialog.manager';
  import type { FieldError } from '@/base/Presentation/Utils/classValidation';

  import type ProjectFloorShowModel from '../../core/models/project.floor.show.model';

  import type AddProjectFloorParams from '../../core/params/add.project.floor.params';

  import EditProjectFloorParams, {
    type EditProjectFloorItemParams,
  } from '../../core/params/edit.project.floor.params';

  import ShowProjectFloorParams from '../../core/params/show.project.floor.params';

  import ProjectFloorController from '../controllers/project.floor.controller';

  import ProjectFloorForm from './ProjectFloorForm.vue';

  const controller = ProjectFloorController.getInstance();

  const route = useRoute();

  const { t } = useI18n();

  const projectFloor = ref<ProjectFloorShowModel | null>(null);

  const params = ref<EditProjectFloorParams | null>(null);

  const initialLoading = ref(true);

  const saving = ref(false);

  const loadError = ref<string | null>(null);

  const validationErrors = ref<Record<string, string>>({});

  const toPositiveInteger = (value: unknown): number | undefined => {
    const normalizedValue = Array.isArray(value) ? value[0] : value;

    const numberValue = Number(normalizedValue);

    return Number.isInteger(numberValue) && numberValue > 0 ? numberValue : undefined;
  };

  const projectFloorId = computed<number | undefined>(() => {
    return toPositiveInteger(route.params.project_floor_id);
  });

  const routeProjectId = computed<number | undefined>(() => {
    return toPositiveInteger(route.query.project_id);
  });

  const routeProjectPreviewId = computed<number | undefined>(() => {
    return toPositiveInteger(route.query.project_preview_id);
  });

  const projectId = computed<number | undefined>(() => {
    return (
      toPositiveInteger(projectFloor.value?.project_id) ??
      toPositiveInteger(projectFloor.value?.project?.id) ??
      routeProjectId.value
    );
  });

  const projectPreviewId = computed<number | undefined>(() => {
    return (
      toPositiveInteger(projectFloor.value?.project_preview_id) ??
      toPositiveInteger(projectFloor.value?.project_preview?.id) ??
      routeProjectPreviewId.value
    );
  });

  /**
   * تحويل floors القادمة من الفورم إلى
   * الشكل المطلوب داخل EditProjectFloorParams.
   */
  const mapFloorsForEdit = (data: AddProjectFloorParams): EditProjectFloorItemParams[] => {
    const currentProjectFloorId = projectFloorId.value;

    const currentFloorNumber = Number(projectFloor.value?.floor_number);

    return (data.floors ?? []).map((floor, index) => {
      /**
       * نربط ID بالدور الحالي باستخدام
       * floor_number.
       *
       * وفي حالة عدم توفر floor_number
       * نعتبر أول دور هو الدور المفتوح.
       */
      const isCurrentFloor =
        Number(floor.floor_number) === currentFloorNumber ||
        (!Number.isFinite(currentFloorNumber) && index === 0);

      return {
        project_floor_id: isCurrentFloor ? currentProjectFloorId : floor.project_floor_id,

        floor_number: floor.floor_number,

        attachments: floor.attachments,

        spaces: floor.spaces ?? [],
      };
    });
  };

  const updateData = (data: AddProjectFloorParams): void => {
    const currentProjectFloorId = projectFloorId.value;

    const currentProjectId = toPositiveInteger(data.project_id) ?? projectId.value;

    if (!currentProjectFloorId || !currentProjectId) {
      params.value = null;
      return;
    }

    const currentPreviewId = toPositiveInteger(data.project_preview_id) ?? projectPreviewId.value;

    params.value = new EditProjectFloorParams({
      id: currentProjectFloorId,

      project_id: currentProjectId,

      /**
       * undefined يُرسل عند عدم وجود Preview.
       * لا يتم إرسال صفر.
       */
      project_preview_id: currentPreviewId,

      site_description: data.site_description ?? '',

      technical_general_notes: data.technical_general_notes ?? '',

      inspection_recommendations: data.inspection_recommendations ?? '',

      floors: mapFloorsForEdit(data),
    });

    validationErrors.value = {};
  };

  const mapValidationErrors = (errors: FieldError[]): Record<string, string> => {
    return Object.fromEntries(errors.map((error) => [error.field, error.message]));
  };

  const mapServerValidationErrors = (errors?: Record<string, string[]>): Record<string, string> => {
    if (!errors) {
      return {};
    }

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
        validation.errors[0]?.message ?? t('Project.validation.cant_send_empty_data'),
      );

      return null;
    }

    return params.value;
  };

  const saveProjectFloor = async (): Promise<void> => {
    if (saving.value) {
      return;
    }

    const requestParams = getValidatedParams();

    if (!requestParams) {
      return;
    }

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

  const fetchProjectFloor = async (): Promise<void> => {
    const currentProjectFloorId = projectFloorId.value;

    initialLoading.value = true;

    loadError.value = null;

    projectFloor.value = null;

    params.value = null;

    validationErrors.value = {};

    if (!currentProjectFloorId) {
      loadError.value = t('failed_to_load_data');

      initialLoading.value = false;

      return;
    }

    try {
      const result = await controller.fetchOne(
        new ShowProjectFloorParams({
          project_floor_id: currentProjectFloorId,

          project_id: routeProjectId.value,

          project_preview_id: routeProjectPreviewId.value,

          allLocales: true,
        }),
      );

      if (result instanceof DataSuccess && result.data) {
        projectFloor.value = result.data;

        return;
      }

      loadError.value = result.error?.displayMessage ?? t('failed_to_load_data');
    } catch {
      loadError.value = controller.errorMessage.value ?? t('failed_to_load_data');
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
      <span>
        {{ loadError }}
      </span>

      <button class="btn btn-primary retry-button" type="button" @click="fetchProjectFloor">
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
        class="btn btn-primary"
        :class="{
          'btn--loading': saving,
        }"
        type="button"
        :disabled="saving || !params"
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

  .retry-button {
    width: auto;
    min-width: 150px;
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

  .retry-button {
    width: auto;
  }
</style>
