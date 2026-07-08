<script setup lang="ts">
  import { ref } from 'vue';
  import { useRoute } from 'vue-router';
  import type AddProjectTypeParams from '../../core/params/add.project-type.params.ts';
  import ProjectTypeController from '../controllers/project-type.controller.ts';
  import ProjectTypeForm from './ProjectTypeForm.vue';

  const controller = ProjectTypeController.getInstance();
  const route = useRoute();
  const params = ref<AddProjectTypeParams | null>(null);
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
  <div class="project-crud-page">
    <ProjectTypeForm :loading="loading" @update-data="params = $event" />
    <button
      :class="{ 'btn--loading': loading }"
      class="btn btn-primary"
      type="button"
      :disabled="loading"
      @click="saveProject"
    >
      {{ $t('project.save') }}
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

  .btn-primary {
    width: 100%;
  }
</style>
