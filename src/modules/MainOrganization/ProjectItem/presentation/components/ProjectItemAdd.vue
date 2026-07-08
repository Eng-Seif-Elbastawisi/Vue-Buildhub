<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';

  import ProjectItemController from '../controllers/project.Item.controller';
  import type AddProjectItemParams from '../../core/params/add.project.Item.params';
  import IndexProjectItemParams from '../../core/params/index.project.Item.params';

  import ProjectItemForm from './ProjectItemForm.vue';
  import ProjectItemTable from './ProjectItemIndex.vue';
  import type ProjectItemModel from '../../core/models/project.Item.model';

  import ProjectFloorShow from '../../../ProjectFloor/presentation/components/ProjectFloorShow.vue';
  import ProjectSteps from '@/modules/MainOrganization/Project/presentation/components/ProjectSteps.vue';
  import ProjectPricingAdd from '@/modules/MainOrganization/ProjectPricing/presentation/components/ProjectPricingAdd.vue';

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

  const projectItems = computed<ProjectItemModel[]>(() => {
    const state = controller.listState.value as any;

    const data =
      state?.data?.data ??
      state?.data ??
      state?.response?.data?.data ??
      state?.response?.data ??
      [];

    const items = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];

    return items as ProjectItemModel[];
  });

  const fetchProjectItems = async () => {
    await controller.fetchList(
      new IndexProjectItemParams('', 1, 100, 0, undefined, projectId.value),
    );
  };

  const saveItems = async () => {
    if (!params.value) return;
    if (!params.value.items.length) return;

    loading.value = true;

    try {
      await controller.create(params.value, undefined, formKey);
      await fetchProjectItems();
      params.value = null;
    } finally {
      loading.value = false;
    }
  };

  onMounted(async () => {
    await fetchProjectItems();
  });
</script>

<template>
  <div class="item-crud-page">
    <ProjectSteps :current-step="4" />

    <ProjectFloorShow :project="projectId" />

    <ProjectItemForm
      :form-key="formKey"
      :loading="loading"
      :project="projectId"
      :project-item="projectItem"
      @update-data="params = $event"
    />

    <div class="actions" :class="{ disabled: loading }">
      <button
        :class="{ 'btn--loading': loading }"
        class="btn btn-primary w-full"
        type="button"
        :disabled="loading || !params?.items?.length"
        @click="saveItems"
      >
        <span v-if="loading" class="loader"></span>
        <span v-else>{{ $t('project_item.save') }}</span>
      </button>
    </div>

    <ProjectItemTable :items="projectItems" :loading="loading" />

    <div v-if="controller.errorMessage.value" class="error">
      {{ controller.errorMessage.value }}
    </div>
    <ProjectPricingAdd :project-id="projectId" :form-key="formKey" :loading="loading" />
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
