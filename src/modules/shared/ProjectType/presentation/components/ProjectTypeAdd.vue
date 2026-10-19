<script setup lang="ts">
  import StandardFormLayout from '@/shared/components/form/StandardFormLayout.vue';
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
  <StandardFormLayout mode="create" class="project-crud-page">
    <ProjectTypeForm :loading="loading" @update-data="params = $event" />

    <div v-if="controller.errorMessage.value" class="error">
      {{ controller.errorMessage.value }}
    </div>

    <template #actions>
      <div class="form-actions">
        <button
          :class="{ 'btn--loading': loading }"
          class="btn btn-primary"
          type="button"
          :disabled="loading"
          @click="saveProject"
        >
          {{ $t('project.save') }}
        </button>
      </div>
    </template>
  </StandardFormLayout>
</template>
