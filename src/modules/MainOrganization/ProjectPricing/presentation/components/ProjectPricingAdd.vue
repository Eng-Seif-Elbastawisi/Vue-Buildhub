<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';

  import ProjectPricingController from '../controllers/project.pricing.controller';
  import type AddProjectPricingParams from '../../core/params/add.project.pricing.params';
  import ProjectPricingForm from './ProjectPricingForm.vue';

  import ProjectItemController from '@/modules/MainOrganization/ProjectItem/presentation/controllers/project.Item.controller';
  import IndexProjectItemParams from '@/modules/MainOrganization/ProjectItem/core/params/index.project.Item.params';
  import type ProjectItemModel from '@/modules/MainOrganization/ProjectItem/core/models/project.Item.model';

  const controller = ProjectPricingController.getInstance();
  const projectItemController = ProjectItemController.getInstance();

  const route = useRoute();
  const formKey = route.fullPath;

  const params = ref<AddProjectPricingParams | null>(null);
  const loading = ref(false);
  const itemsLoading = ref(false);

  const projectId = computed(() => {
    const value = Number(route.query.project_id);

    return Number.isNaN(value) ? 0 : value;
  });

  const projectItems = computed<ProjectItemModel[]>(() => {
    const state = projectItemController.listState.value as any;

    const data =
      state?.data?.data ??
      state?.data ??
      state?.response?.data?.data ??
      state?.response?.data ??
      [];

    const items = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];

    return items as ProjectItemModel[];
  });

  const totalItemsPrice = computed(() => {
    return projectItems.value.reduce((total, item) => {
      return total + Number(item.final_price ?? 0);
    }, 0);
  });

  const fetchProjectItems = async () => {
    if (!projectId.value) return;

    itemsLoading.value = true;

    try {
      await projectItemController.fetchList(
        new IndexProjectItemParams('', 1, 100, 0, undefined, projectId.value),
      );
    } finally {
      itemsLoading.value = false;
    }
  };

  const saveItem = async () => {
    if (!params.value) return;

    loading.value = true;

    try {
      await controller.create(params.value, undefined, formKey);
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
    <ProjectPricingForm
      :form-key="formKey"
      :loading="loading || itemsLoading"
      :project-id="projectId"
      :total-items-price="totalItemsPrice"
      @update-data="params = $event"
    />

    <div class="actions" :class="{ disabled: loading || itemsLoading }">
      <button
        class="btn btn-primary w-full"
        type="button"
        :disabled="loading || itemsLoading"
        @click="saveItem"
      >
        <span v-if="loading" class="loader"></span>
        <span v-else>{{ $t('project_pricing.save') }}</span>
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
