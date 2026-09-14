<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import type AddItemTypesParams from '../../core/params/add.item.types.params.js';
  import EditItemTypesParams from '../../core/params/edit.item.types.params.js';
  import ShowItemTypesParams from '../../core/params/show.item.types.params.js';
  import ItemTypesController from '../controllers/item.types.controller.js';
  import ItemTypesForm from './ItemTypesForm.vue';
  const controller = ItemTypesController.getInstance();
  const route = useRoute();
  const itemTypesId = Number(route.params.item_types_id);
  const params = ref<EditItemTypesParams | null>(null);
  const loading = ref(false);
  const updateData = (data: AddItemTypesParams) => {
    params.value = new EditItemTypesParams({
      itemTypesId,
      translations: data.translations,
      type: data.type,
      code: data.code,
    });
  };
  const saveItemTypes = async () => {
    if (!params.value) return;
    loading.value = true;
    try {
      await controller.update(params.value, undefined, route.fullPath);
    } finally {
      loading.value = false;
    }
  };
  onMounted(async () => {
    if (!itemTypesId || Number.isNaN(itemTypesId)) {
      console.error('Invalid Item Types ID:', route.params.item_types_id);
      return;
    }
    await controller.fetchOne(new ShowItemTypesParams({ itemTypesId, allLocales: true }));
  });
</script>
<template>
  <div class="ItemTypes-crud-page">
    <ItemTypesForm
      :ItemTypes="controller.itemData.value!"
      :loading="loading"
      @update-data="updateData"
    />
    <button
      class="btn btn-primary"
      :class="{ 'btn--loading': loading }"
      type="button"
      :disabled="loading"
      @click="saveItemTypes"
    >
      {{ $t('ItemTypes.update') }}
    </button>
    <div v-if="controller.errorMessage.value" class="error">
      {{ controller.errorMessage.value }}
    </div>
  </div>
</template>
<style scoped>
  .ItemTypes-crud-page {
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
