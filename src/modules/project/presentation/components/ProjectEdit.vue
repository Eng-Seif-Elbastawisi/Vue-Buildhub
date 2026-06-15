<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import type AddProjectParams from '../../core/params/add.project.params';
  import EditProjectParams from '../../core/params/edit.project.params';
  import ShowProjectParams from '../../core/params/show.project.params';
  import ProjectController from '../controllers/project.controller';
  import ProjectForm from './ProjectForm.vue';

  const controller = ProjectController.getInstance();
  const route = useRoute();
  const projectId = Number(route.params.project_id);
  const params = ref<EditProjectParams | null>(null);
  const loading = ref(false);
  const updateData = (data: AddProjectParams) => {
    params.value = new EditProjectParams({
      projectId,
      name: data.name,
      projectType: data.projectType,
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
    await controller.fetchOne(new ShowProjectParams({ projectId }));
  });
</script>

<template>
  <div class="project-crud-page">
    <ProjectForm
      :project="controller.itemData.value!"
      :loading="loading"
      @update-data="updateData"
    />
    <button class="btn btn-primary" type="button" :disabled="loading" @click="saveProject">
      {{ $t('project.update') }}
    </button>
    <div v-if="controller.errorMessage.value" class="error">
      {{ controller.errorMessage.value }}
    </div>
  </div>
</template>

<style scoped>
  .project-crud-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  .error {
    color: var(--danger-dark);
  }
</style>
