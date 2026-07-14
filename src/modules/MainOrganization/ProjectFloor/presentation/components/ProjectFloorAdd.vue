<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';

  import type AddProjectFloorParams from '../../core/params/add.project.floor.params';
  import IndexProjectFloorParams from '../../core/params/index.project.floor.params';

  import ProjectFloorController from '../controllers/project.floor.controller';
  import ProjectFloorForm from './ProjectFloorForm.vue';
  import ProjectSteps from '../../../Project/presentation/components/ProjectSteps.vue';
  import type ProjectFloorModel from '../../core/models/project.floor.model';
  import type AddFinalProjectFloorResultParams from '../../core/params/final.result.project.floor.params';
  import FinalResults from './FinalResults.vue';

  import router from '@/router/index';
  import { useUserStore } from '@/stores/user';
  import { type FloorNumber } from '../../core/constants/floor.number.enum.ts';
  import { useI18n } from 'vue-i18n';
  import { getFloorNumberNameKey } from '../../core/constants/floor.number.enum';
  const controller = ProjectFloorController.getInstance();

  const route = useRoute();
  const userStore = useUserStore();
  const { t } = useI18n();
  const params = ref<AddProjectFloorParams | null>(null);
  const loading = ref(false);

  const projectFloorFormRef = ref<{
    resetForm: () => void;
  } | null>(null);

  const getPrefix = () => {
    return userStore.user?.type === 1 ? '/mainportal' : '/organization';
  };

  const projectId = computed(() => {
    const value = Number(route.query.project_id);

    return Number.isNaN(value) ? 0 : value;
  });

  const projectPreviewId = computed(() => {
    const value = Number(route.query.project_preview_id);

    return Number.isNaN(value) ? 0 : value;
  });

  const projectFloors = computed<ProjectFloorModel[]>(() => {
    const state = controller.listState.value as any;

    const data =
      state?.data?.data ??
      state?.response?.data?.data ??
      state?.data ??
      state?.response?.data ??
      [];

    if (Array.isArray(data)) {
      return data as ProjectFloorModel[];
    }

    if (Array.isArray(data?.data)) {
      return data.data as ProjectFloorModel[];
    }

    return [];
  });

  const projectItem = computed(() => {
    return projectFloors.value[0]?.id ?? 0;
  });

  const fetchProjectFloors = async () => {
    await controller.fetchList(new IndexProjectFloorParams('', 1, 100, 1, null, projectId.value));
  };

  const saveProjectFloor = async () => {
    if (!params.value) return;

    loading.value = true;

    try {
      await controller.create(params.value, undefined, route.fullPath);

      await fetchProjectFloors();

      projectFloorFormRef.value?.resetForm();
      params.value = null;
    } finally {
      loading.value = false;
    }
  };

  const submitFinalResult = async (finalParams: AddFinalProjectFloorResultParams) => {
    loading.value = true;

    try {
      await controller.getProject(finalParams);

      await router.push({
        path: `${getPrefix()}/project-item/add`,
        query: {
          project_id: projectId.value,
          project_item: projectItem.value,
        },
      });
    } finally {
      loading.value = false;
    }
  };

  onMounted(async () => {
    await fetchProjectFloors();
  });
  const floorTitle = (floorNumber?: number | string | null) => {
    if (floorNumber === null || floorNumber === undefined) return '-';

    const key = getFloorNumberNameKey(floorNumber as FloorNumber);

    return key === 'unknown' ? String(floorNumber) : t(key);
  };
</script>

<template>
  <div class="ProjectFloor-crud-page">
    <ProjectSteps :current-step="3" />

    <ProjectFloorForm
      ref="projectFloorFormRef"
      :loading="loading"
      :project-id="projectId"
      :project-preview-id="projectPreviewId"
      @update-data="params = $event"
    />

    <button
      :class="{ 'btn--loading': loading }"
      class="btn btn-primary"
      type="button"
      :disabled="loading || !params"
      @click="saveProjectFloor"
    >
      {{ $t('Project.save') }}
    </button>

    <section v-if="projectFloors.length" class="saved-floors">
      <header class="saved-floors__header">
        <div>
          <h3>{{ $t('ProjectFloor.selected_spaces') }}</h3>
          <p>{{ $t('ProjectFloor.selected_spaces_description') }}</p>
        </div>

        <strong>{{ projectFloors.length }}</strong>
      </header>

      <article v-for="floor in projectFloors" :key="floor.id" class="saved-floor-card">
        <div class="saved-floor-card__head">
          <h4>
            {{ $t('ProjectFloor.floor_number') }}:
            {{ floorTitle(floor.floor_number) }}
          </h4>

          <span>
            {{ Array.isArray(floor.spaces) ? floor.spaces.length : 0 }}
          </span>
        </div>

        <div v-if="Array.isArray(floor.spaces) && floor.spaces.length" class="saved-spaces-table">
          <div class="saved-spaces-table__head">
            <span>#</span>
            <span>{{ $t('ProjectFloor.space') }}</span>
            <span>{{ $t('ProjectFloor.length') }}</span>
            <span>{{ $t('ProjectFloor.width') }}</span>
            <span>{{ $t('ProjectFloor.height') }}</span>
            <span>{{ $t('ProjectFloor.notes') }}</span>
            <span>{{ $t('ProjectFloor.attachments') }}</span>
          </div>

          <div v-for="(space, index) in floor.spaces" :key="space.id" class="saved-space-row">
            <span>{{ index + 1 }}</span>

            <strong>
              {{ space.space?.title ?? '-' }}
            </strong>

            <span>{{ space.length ?? '-' }}</span>
            <span>{{ space.width ?? '-' }}</span>
            <span>{{ space.height ?? '-' }}</span>
            <span>{{ space.notes ?? '-' }}</span>

            <span>
              {{ Array.isArray(space.attachments) ? space.attachments.length : 0 }}
            </span>
          </div>
        </div>

        <div v-else class="saved-floor-empty">
          {{ $t('ProjectFloor.no_spaces_title') }}
        </div>
      </article>
    </section>

    <FinalResults
      :project-id="projectId"
      :project-preview-id="projectPreviewId"
      :loading="loading"
      @submit-final-result="submitFinalResult"
    />

    <div v-if="controller.errorMessage.value" class="error">
      {{ controller.errorMessage.value }}
    </div>
  </div>
</template>

<style scoped lang="scss">
  .ProjectFloor-crud-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
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

  .saved-floors {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .saved-floors__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem;
    border: 1px solid rgba(148, 163, 184, 0.18);
    border-radius: 20px;
    background: var(--BgWhite);

    h3 {
      margin: 0;
      color: #111827;
      font-family: 'Bold';
      font-size: 1rem;
    }

    p {
      margin: 0.25rem 0 0;
      color: #64748b;
      font-size: var(--xs-size);
    }

    strong {
      display: inline-flex;
      min-width: 42px;
      height: 42px;
      align-items: center;
      justify-content: center;
      border-radius: 999px;
      background: var(--PrimaryColor-light);
      color: var(--PrimaryColor);
      font-family: 'Bold';
    }
  }

  .saved-floor-card {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
    padding: 1rem;
    border: 1px solid rgba(148, 163, 184, 0.18);
    border-radius: 22px;
    background: #fff;
  }

  .saved-floor-card__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.85rem 1rem;
    border-radius: 16px;
    background: var(--PrimaryColor-light);

    h4 {
      margin: 0;
      color: var(--PrimaryColor);
      font-family: 'Bold';
      font-size: var(--sm-size);
    }

    span {
      display: inline-flex;
      min-width: 34px;
      height: 34px;
      align-items: center;
      justify-content: center;
      border-radius: 999px;
      background: var(--BgWhite);
      color: var(--PrimaryColor);
      font-family: 'Bold';
    }
  }

  .saved-spaces-table {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid rgba(148, 163, 184, 0.18);
    border-radius: 16px;
  }

  .saved-spaces-table__head,
  .saved-space-row {
    display: grid;
    grid-template-columns: 44px 1.4fr repeat(4, 1fr) 0.8fr;
    gap: 0.65rem;
    align-items: center;
  }

  .saved-spaces-table__head {
    padding: 0.75rem 1rem;
    background: #f8fafc;
    color: #64748b;
    font-family: 'Bold';
    font-size: var(--xs-size);
  }

  .saved-space-row {
    padding: 0.75rem 1rem;
    border-top: 1px solid rgba(148, 163, 184, 0.18);
    color: #334155;
    font-family: 'Medium';
    font-size: var(--sm-size);

    strong {
      overflow: hidden;
      color: #111827;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .saved-floor-empty {
    padding: 1rem;
    border: 1px dashed rgba(148, 163, 184, 0.45);
    border-radius: 16px;
    color: #64748b;
    text-align: center;
    font-family: 'Medium';
  }

  @media (max-width: 992px) {
    .saved-spaces-table__head {
      display: none;
    }

    .saved-space-row {
      grid-template-columns: 1fr;
    }
  }
</style>
