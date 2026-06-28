<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import type AddProjectParams from '../../core/params/add.project.params.ts';
  import EditProjectParams from '../../core/params/edit.project.params.ts';
  import ShowProjectParams from '../../core/params/show.project.params.ts';
  import ProjectController from '../controllers/project.controller.ts';
  import ProjectForm from './ProjectForm.vue';

  const controller = ProjectController.getInstance();
  const route = useRoute();
  const projectId = Number(route.params.project_id);
  const params = ref<EditProjectParams | null>(null);
  const loading = ref(false);
  const updateData = (data: AddProjectParams) => {
    params.value = new EditProjectParams({
      projectId,
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
    });
  };
  const saveProject = async () => {
    if (!params.value) return;
    loading.value = true;
    try {
      await controller.update(params.value, undefined, route.fullPath);
    } finally {
      loading.value = false;
    }
  };
  onMounted(async () => {
    await controller.fetchOne(new ShowProjectParams({ projectId, allLocales: true }));
  });
</script>

<template>
  <div class="Project-crud-page">
    <ProjectForm
      :Project="controller.itemData.value!"
      :loading="loading"
      :is-edit="true"
      @update-data="updateData"
    />
    <button class="btn btn-primary" type="button" :disabled="loading" @click="saveProject">
      {{ $t('Project.update') }}
    </button>
    <div v-if="controller.errorMessage.value" class="error">
      {{ controller.errorMessage.value }}
    </div>
  </div>
</template>

<style scoped>
  .Project-crud-page {
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
