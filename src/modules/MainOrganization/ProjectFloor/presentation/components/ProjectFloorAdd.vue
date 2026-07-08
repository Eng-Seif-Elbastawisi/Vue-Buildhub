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

  const controller = ProjectFloorController.getInstance();

  const route = useRoute();
  const userStore = useUserStore();

  const params = ref<AddProjectFloorParams | null>(null);
  const loading = ref(false);
  const projectItem = computed(() => {
    return projectFloor.value?.id ?? 0;
  });
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

  const projectFloor = computed<ProjectFloorModel | undefined>(() => {
    const state = controller.listState.value as any;

    const data =
      state?.data ??
      state?.data?.data ??
      state?.response?.data ??
      state?.response?.data?.data ??
      [];

    if (Array.isArray(data)) {
      return data[0] as ProjectFloorModel | undefined;
    }

    if (Array.isArray(data?.data)) {
      return data.data[0] as ProjectFloorModel | undefined;
    }

    return undefined;
  });

  const fetchProjectFloors = async () => {
    await controller.fetchList(new IndexProjectFloorParams('', 1, 20, 1, null, projectId.value));
  };

  const saveProjectFloor = async () => {
    if (!params.value) return;

    loading.value = true;

    try {
      await controller.create(params.value, undefined, route.fullPath);
      await fetchProjectFloors();
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
</script>

<template>
  <div class="ProjectFloor-crud-page">
    <ProjectSteps :current-step="3" />

    <ProjectFloorForm
      :loading="loading"
      :project-floor="projectFloor"
      :project-id="projectId"
      :project-preview-id="projectPreviewId"
      @update-data="params = $event"
    />

    <button
      :class="{ 'btn--loading': loading }"
      class="btn btn-primary"
      type="button"
      :disabled="loading"
      @click="saveProjectFloor"
    >
      {{ $t('Project.save') }}
    </button>

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

<style scoped>
  .ProjectFloor-crud-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .error {
    color: var(--danger-dark);
  }

  .btn-primary {
    width: 100%;
  }
</style>
