<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import type AddProjectFloorParams from '../../core/params/add.project.floor.params.ts';
  import ProjectFloorController from '../controllers/project.floor.controller.ts';
  import ProjectFloorForm from './ProjectFloorForm.vue';
  import ProjectSteps from '../../../Project/presentation/components/ProjectSteps.vue';

  const controller = ProjectFloorController.getInstance();
  const route = useRoute();
  const params = ref<AddProjectFloorParams | null>(null);
  const loading = ref(false);
  const projectId = computed(() => Number(route.query.project_id));
  const projectPreviewId = computed(() => Number(route.query.project_preview_id));
  const saveProjectFloor = async () => {
    if (!params.value) return;
    loading.value = true;
    try {
      await controller.create(params.value, undefined, route.fullPath);
    } finally {
      loading.value = false;
    }
  };
</script>

<template>
  <div class="ProjectFloor-crud-page">
    <ProjectSteps :current-step="3" />
    <ProjectFloorForm
      :loading="loading"
      :project-id="projectId"
      :project-preview-id="projectPreviewId"
      @update-data="params = $event"
    />
    <button class="btn btn-primary" type="button" :disabled="loading" @click="saveProjectFloor">
      {{ $t('Project.save') }}
    </button>
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
