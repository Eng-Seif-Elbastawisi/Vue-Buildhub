<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import type AddSupplyParams from '../../core/params/add.supply.params.ts';
  import EditSupplyParams from '../../core/params/edit.supply.params.ts';
  import ShowSupplyParams from '../../core/params/show.supply.params.ts';
  import SupplyController from '../controllers/supply.controller.ts';
  import SupplyForm from './SupplyForm.vue';

  const controller = SupplyController.getInstance();
  const route = useRoute();
  const formKey = route.fullPath;
  const params = ref<EditSupplyParams | null>(null);
  const loading = ref(false);
  const supplyId = Number(route.params.supply_id);

  const updateData = (data: AddSupplyParams) => {
    params.value = new EditSupplyParams({
      supply_id: supplyId,
      brandId: data.brandId,
      measurementId: data.measurementId,
      price: data.price,
      translations: data.translations,
    });
  };

  const saveSupply = async () => {
    if (!params.value) return;
    loading.value = true;
    try {
      await controller.update(params.value, undefined, formKey);
    } finally {
      loading.value = false;
    }
  };

  onMounted(async () => {
    await controller.fetchOne(new ShowSupplyParams({ supply_id: supplyId, allLocales: true }));
  });
</script>

<template>
  <div class="supply-crud-page">
    <SupplyForm
      :supply="controller.itemData.value!"
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
        @click="saveSupply"
      >
        <span v-if="loading" class="loader"></span>
        <span v-else>{{ $t('supply.update') }}</span>
      </button>
    </div>

    <div v-if="controller.errorMessage.value" class="error">
      {{ controller.errorMessage.value }}
    </div>
  </div>
</template>

<style scoped lang="scss">
  .supply-crud-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .actions.disabled {
    pointer-events: none;
    opacity: 0.7;
  }

  .error {
    margin-top: 20px;
    padding: 10px;
    background-color: var(--danger-light);
    color: var(--danger-dark);
    border: 1px solid #f5c6cb;
    border-radius: 4px;
  }
</style>
