<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { useRoute } from 'vue-router';

  import ProjectItemController from '../controllers/project.Item.controller';
  import type AddProjectItemParams from '../../core/params/add.project.Item.params';
  import ProjectItemForm from './ProjectItemForm.vue';
  import ProjectFloorShow from '../../../ProjectFloor/presentation/components/ProjectFloorShow.vue';

  const controller = ProjectItemController.getInstance();

  const route = useRoute();
  const formKey = route.fullPath;

  const params = ref<AddProjectItemParams | null>(null);
  const loading = ref(false);

  const projectId = computed(() => {
    const value = Number(route.query.project_id);

    return Number.isNaN(value) ? 0 : value;
  });

  const projectItem = computed(() => {
    const value = Number(route.query.project_item);

    return Number.isNaN(value) ? 0 : value;
  });

  const saveItem = async () => {
    if (!params.value) return;

    loading.value = true;

    try {
      await controller.create(params.value, undefined, formKey);
    } finally {
      loading.value = false;
    }
  };
</script>

<template>
  <ProjectFloorShow />
  <div class="item-crud-page">
    <ProjectItemForm
      :form-key="formKey"
      :loading="loading"
      :project="projectId"
      :project-item="projectItem"
      :spaces="projectFloor?.spaces ?? []"
      @update-data="params = $event"
    />

    <div class="actions" :class="{ disabled: loading }">
      <button class="btn btn-primary w-full" type="button" @click="saveItem">
        <span v-if="loading" class="loader"></span>
        <span v-else>{{ $t('project_item.save') }}</span>
      </button>
    </div>

    <div v-if="controller.errorMessage.value" class="error">
      {{ controller.errorMessage.value }}
    </div>
  </div>
</template>

<style scoped lang="scss">
  .item-crud-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .actions.disabled {
    pointer-events: none;
    opacity: 0.7;
  }

  .error {
    color: var(--danger-dark);
  }
</style>
