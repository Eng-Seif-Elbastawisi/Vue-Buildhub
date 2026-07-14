<script setup lang="ts">
  import { ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useRoute } from 'vue-router';
  import { dialogManager } from '@/base/Presentation/Dialogs/dialog.manager';
  import type AddProjectParams from '../../core/params/add.project.params.ts';
  import ProjectController from '../controllers/project.controller.ts';
  import ProjectForm from './ProjectForm.vue';
  import ProjectSteps from './ProjectSteps.vue';

  const controller = ProjectController.getInstance();
  const route = useRoute();
  const { t } = useI18n();
  const params = ref<AddProjectParams | null>(null);
  const loading = ref(false);

  const canSubmitProject = () => {
    if (!params.value) {
      dialogManager.toastWarning(t('Project.validation.cant_send_empty_data'));
      return false;
    }

    const validation = params.value.validate();
    if (!validation.isValid) {
      dialogManager.toastWarning(
        validation.errors[0]?.message || t('Project.validation.cant_send_empty_data'),
      );
      return false;
    }

    return true;
  };

  const saveProject = async () => {
    if (!canSubmitProject() || !params.value) return;
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
    <ProjectSteps :current-step="1" />
    <ProjectForm :loading="loading" :is-edit="false" @update-data="params = $event" />
    <button
      :class="{ 'btn--loading': loading }"
      class="btn btn-primary"
      type="button"
      :disabled="loading"
      @click="saveProject"
    >
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
