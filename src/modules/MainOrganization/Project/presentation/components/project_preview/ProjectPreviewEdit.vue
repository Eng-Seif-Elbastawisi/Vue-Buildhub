<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import type AddProjectPreviewParams from '../../../core/params/add.project.preview.params.ts';
  import EditProjectPreviewParams from '../../../core/params/edit.project.preview.params.ts';
  import ProjectPreviewController from '../../controllers/project.preview.controller.ts';
  import ProjectPreviewForm from '../project_preview/ProjectPreviewForm.vue';
import ShowProjectPreviewParams from '../../../core/params/show.project.preview.params.ts';

  const controller = ProjectPreviewController.getInstance();
  const route = useRoute();
  const previewId = Number(route.params.preview_id);
  const params = ref<EditProjectPreviewParams | null>(null);
  const loading = ref(false);
  const updateData = (data: AddProjectPreviewParams) => {
    params.value = new EditProjectPreviewParams({
      id: previewId,
      engineer_id: data.engineer_id,
      preview_date: data.preview_date,
      preview_time: data.preview_time,
      site_link: data.site_link,
      address: data.address,
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
    await controller.fetchOne(new ShowProjectPreviewParams({ previewId }));
  });
</script>

<template>
  <div class="ProjectPreviewEdit-crud-page">
    <ProjectPreviewForm
      :project_preview="controller.itemData.value!"
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
  .ProjectPreviewEdit-crud-page {
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
