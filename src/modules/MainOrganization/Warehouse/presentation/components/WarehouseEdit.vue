<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import type AddWarehouseParams from '../../core/params/add.warehouse.params.ts';
  import EditWarehouseParams from '../../core/params/edit.warehouse.params.ts';
  import ShowWarehouseParams from '../../core/params/show.warehouse.params.ts';
  import WarehouseController from '../controllers/warehouse.controller.ts';
  import WarehouseForm from './WarehouseForm.vue';

  const controller = WarehouseController.getInstance();
  const route = useRoute();
  const warehouseId = Number(route.params.warehouse_id);
  const params = ref<EditWarehouseParams | null>(null);
  const loading = ref(false);
  const updateData = (data: AddWarehouseParams) => {
    params.value = new EditWarehouseParams({
      warehouseId,
      translations: data.translations,
    });
  };
  const saveWarehouse = async () => {
    if (!params.value) return;
    loading.value = true;
    try {
      await controller.update(params.value, undefined, route.fullPath);
    } finally {
      loading.value = false;
    }
  };
  onMounted(async () => {
    await controller.fetchOne(new ShowWarehouseParams({ warehouseId, allLocales: true }));
  });
</script>

<template>
  <div class="Warehouse-crud-page">
    <WarehouseForm
      :warehouse="controller.itemData.value!"
      :loading="loading"
      @update-data="updateData"
    />
    <button
      :class="{ 'btn--loading': loading }"
      class="btn btn-primary"
      type="button"
      :disabled="loading"
      @click="saveWarehouse"
    >
      {{ $t('Warehouse.update') }}
    </button>
    <div v-if="controller.errorMessage.value" class="error">
      {{ controller.errorMessage.value }}
    </div>
  </div>
</template>

<style scoped>
  .Warehouse-crud-page {
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
