<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { useRoute } from 'vue-router';

  import AddProjectPreviewParams from '../../../core/params/add.project.preview.params';
  import ProjectPreviewController from '../../controllers/project.preview.controller';
  import ProjectPreviewForm from '../project_preview/ProjectPreviewForm.vue';
  import ProjectSteps from '../ProjectSteps.vue';

  const controller = ProjectPreviewController.getInstance();
  const route = useRoute();

  const params = ref<AddProjectPreviewParams | null>(null);
  const loading = ref(false);

  const projectId = computed(() => Number(route.params.id || route.query.project_id));

  const withProjectId = (value: AddProjectPreviewParams) => {
    return new AddProjectPreviewParams({
      project_id: projectId.value,
      engineer_id: value.engineer_id,
      preview_date: value.preview_date,
      preview_time: value.preview_time,
      site_link: value.site_link,
      address: value.address,
    });
  };

  const updateData = (value: AddProjectPreviewParams) => {
    params.value = withProjectId(value);
  };

  const saveProjectPreview = async () => {
    if (!params.value || !projectId.value) return;

    loading.value = true;

    try {
      await controller.create(withProjectId(params.value), undefined, route.fullPath);
    } finally {
      loading.value = false;
    }
  };
</script>

<template>
  <div class="ProjectPreviewAdd-crud-page">
    <ProjectSteps :current-step="2" />
    <ProjectPreviewForm
      :loading="loading"
      :project-id="projectId"
      @update-data="updateData"
    />

    <button
      class="btn btn-primary"
      type="button"
      :disabled="loading || !projectId"
      @click="saveProjectPreview"
    >
      {{ $t('Project.save') }}
    </button>

    <div v-if="controller.errorMessage.value" class="error">
      {{ controller.errorMessage.value }}
    </div>
  </div>
</template>

<style scoped>
  .ProjectPreviewAdd-crud-page {
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