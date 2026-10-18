<script setup lang="ts">
  import StandardFormLayout from '@/shared/components/form/StandardFormLayout.vue';
  import { onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import type AddProjectTypeParams from '../../core/params/add.project-type.params.ts';
  import EditProjectTypeParams from '../../core/params/edit.project-type.params.ts';
  import ShowProjectTypeParams from '../../core/params/show.project-type.params.ts';
  import ProjectTypeController from '../controllers/project-type.controller.ts';
  import ProjectTypeForm from './ProjectTypeForm.vue';

  const controller = ProjectTypeController.getInstance();
  const route = useRoute();
  const projectId = Number(route.params.project_id);
  const params = ref<EditProjectTypeParams | null>(null);
  const loading = ref(false);
  const updateData = (data: AddProjectTypeParams) => {
    params.value = new EditProjectTypeParams({
      projectId,
      name: data.name,
      projectType: data.projectType,
      translations: data.translations,
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
    await controller.fetchOne(new ShowProjectTypeParams({ projectId, allLocales: true }));
  });
</script>

<template>
  <StandardFormLayout mode="edit" class="project-crud-page">
    <ProjectTypeForm
      :project="controller.itemData.value!"
      :loading="loading"
      @update-data="updateData"
    />

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
          {{ $t('project.update') }}
        </button>
      </div>
    </template>
  </StandardFormLayout>
</template>
