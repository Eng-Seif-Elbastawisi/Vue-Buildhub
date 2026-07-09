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
      projectFloorId,
      translations: data.translations,
      client_exist: data.client_exist,
      client_id: data.client_id,
      client_name: data.client_name,
      client_phone: data.client_phone,
      client_source: data.client_source,
      project_type_id: data.project_type_id,
      location_id: data.location_id,
      service_type: data.service_type,
      attachments: data.attachments,
      engineer_id: data.engineer_id,
      preview_date: data.preview_date,
      preview_time: data.preview_time,
      site_link: data.site_link,
      address: data.address,
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
    await controller.fetchOne(new ShowProjectFloorParams({ projectFloorId, allLocales: true }));
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
