<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import ProjectItemController from '../controllers/project.Item.controller.ts';
  import ProjectItemForm from './ProjectItemForm.vue';
  import type AddProjectItemParams from '../../core/params/add.project.Item.params.ts';
  import EditProjectItemParams from '../../core/params/edit.project.Item.params.ts';
  import ShowProjectItemParams from '../../core/params/show.project.Item.params.ts';

  const controller = ProjectItemController.getInstance();
  const route = useRoute();
  const formKey = route.fullPath;
  const params = ref<EditProjectItemParams | null>(null);
  const loading = ref(false);
  const itemId = Number(route.params.id);

  const updateData = (data: AddProjectItemParams) => {
    params.value = new EditProjectItemParams({
      project_item_id: itemId,
      item_id: data.item_id,
      pricing_method: data.pricing_method,
      project_floor_id: data.project_floor_id,
      price: data.price,
      quantity: data.quantity,
    });
  };

  const saveItem = async () => {
    if (!params.value) return;
    loading.value = true;
    try {
      await controller.update(params.value, undefined, formKey);
    } finally {
      loading.value = false;
    }
  };

  onMounted(async () => {
    await controller.fetchOne(
      new ShowProjectItemParams({ project_item_id: itemId, allLocales: true }),
    );
  });
</script>

<template>
  <div class="material-crud-page">
    <ProjectItemForm
      :item="controller.itemData.value!"
      :form-key="formKey"
      :loading="loading"
      @update-data="updateData"
    />

    <div class="actions" :class="{ disabled: loading }">
      <button
        :disabled="loading"
        :class="{ 'btn--loading': loading }"
        class="btn btn-primary w-full"
        type="button"
        @click="saveItem"
      >
        <span v-if="loading" class="loader"></span>
        <span v-else>{{ $t('project_item.update') }}</span>
      </button>
    </div>

    <div v-if="controller.errorMessage.value" class="error">
      {{ controller.errorMessage.value }}
    </div>
  </div>
</template>

<style scoped lang="scss">
  .material-crud-page {
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
