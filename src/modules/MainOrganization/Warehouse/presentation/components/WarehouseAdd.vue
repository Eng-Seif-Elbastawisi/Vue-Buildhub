<script setup lang="ts">
  import StandardFormLayout from '@/shared/components/form/StandardFormLayout.vue';
  import { ref } from 'vue';
  import { useRoute } from 'vue-router';
  import type AddWarehouseParams from '../../core/params/add.warehouse.params.ts';
  import WarehouseController from '../controllers/warehouse.controller.ts';
  import WarehouseForm from './WarehouseForm.vue';

  const controller = WarehouseController.getInstance();
  const route = useRoute();
  const params = ref<AddWarehouseParams | null>(null);
  const loading = ref(false);

  const saveWarehouse = async () => {
    if (!params.value) return;
    loading.value = true;
    try {
      await controller.create(params.value, undefined, route.fullPath);
    } finally {
      loading.value = false;
    }
  };
</script>

<template>
  <StandardFormLayout mode="create" class="Warehouse-crud-page">
    <WarehouseForm :loading="loading" @update-data="params = $event" />

    <div v-if="controller.errorMessage.value" class="error">
      {{ controller.errorMessage.value }}
    </div>

    <template #actions>
      <button
        :class="{ 'btn--loading': loading }"
        class="btn btn-primary"
        type="button"
        :disabled="loading"
        @click="saveWarehouse"
      >
        {{ $t('save') }}
      </button>
    </template>
  </StandardFormLayout>
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
  border: 1px solid var(--bh-coral-soft);
  border-radius: 4px;
}

.btn-primary {
  width: 100%;
}
</style>
