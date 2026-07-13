<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import type AddProjectFloorParams from '../../core/params/add.project.floor.params.ts';
  import EditProjectFloorParams from '../../core/params/edit.project.floor.params.ts';
  import ShowProjectFloorParams from '../../core/params/show.project.floor.params.ts';
  import ProjectFloorController from '../controllers/project.floor.controller.ts';
  import ProjectFloorForm from './ProjectFloorForm.vue';

  const controller = ProjectFloorController.getInstance();
  const route = useRoute();
  const projectFloorId = Number(route.params.project_floor_id);
  const params = ref<EditProjectFloorParams | null>(null);
  const loading = ref(false);
  const updateData = (data: AddProjectFloorParams) => {
    params.value = new EditProjectFloorParams({
      id: projectFloorId,
      project_id: data.project_id,
      project_preview_id: data.project_preview_id,
      floor_number: data.floor_number,
      site_description: data.site_description,
      technical_general_notes: data.technical_general_notes,
      inspection_recommendations: data.inspection_recommendations,
      spaces: data.spaces,
    });
  };
  const saveProjectFloor = async () => {
    if (!params.value) return;
    loading.value = true;
    try {
      await controller.update(params.value, undefined, route.fullPath);
    } finally {
      loading.value = false;
    }
  };
  onMounted(async () => {
    await controller.fetchOne(
      new ShowProjectFloorParams({ project_floor_id: projectFloorId, allLocales: true }),
    );
  });
</script>

<template>
  <div class="ProjectFloor-crud-page">
    <ProjectFloorForm
      :project-floor="controller.itemData.value!"
      :loading="loading"
      :is-edit="true"
      @update-data="updateData"
    />
    <button
      :class="{ 'btn--loading': loading }"
      class="btn btn-primary"
      type="button"
      :disabled="loading"
      @click="saveProjectFloor"
    >
      {{ $t('ProjectFloor.update') }}
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
