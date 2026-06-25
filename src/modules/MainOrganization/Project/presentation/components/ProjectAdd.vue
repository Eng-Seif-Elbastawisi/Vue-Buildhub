<script setup lang="ts">
  import { ref } from 'vue';
  import { useRoute } from 'vue-router';
  import type AddProjectParams from '../../core/params/add.project.params.ts';
  import ProjectController from '../controllers/project.controller.ts';
  import ProjectForm from './ProjectForm.vue';

  const controller = ProjectController.getInstance();
  const route = useRoute();
  const params = ref<AddProjectParams | null>(null);
  const loading = ref(false);

  const saveProject = async () => {
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
  <div class="Project-crud-page">
    <ProjectForm :loading="loading" @update-data="params = $event" />
    <button class="btn btn-primary" type="button" :disabled="loading" @click="saveProject">
      {{ $t('Project.save') }}
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
