<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import type AddMaterialsParams from '../../core/params/add.materials.params';
  import EditMaterialParams from '../../core/params/edit.materials.params';
  import ShowMaterialParams from '../../core/params/show.materials.params';
  import MaterialController from '../controllers/materials.controller';
  import MaterialsForm from './MaterialsForm.vue';

  const controller = MaterialController.getInstance();
  const route = useRoute();
  const formKey = route.fullPath;
  const params = ref<EditMaterialParams | null>(null);
  const loading = ref(false);
  const materialId = Number(route.params.material_id);

  const updateData = (data: AddMaterialsParams) => {
    params.value = new EditMaterialParams({
      material_id: materialId,
      brandId: data.brandId,
      measurementId: data.measurementId,
      price: data.price,
      translations: data.translations,
      itemTypeId: data.itemTypeId,
      stageId: data.stageId,
      subStageId: data.subStageId,
      status: data.status,
    });
  };

  const saveMaterial = async () => {
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
      new ShowMaterialParams({ material_id: materialId, allLocales: true }),
    );
  });
</script>

<template>
  <div class="material-crud-page">
    <MaterialsForm
      :material="controller.itemData.value!"
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
        @click="saveMaterial"
      >
        <span v-if="loading" class="loader"></span>
        <span v-else>{{ $t('material.update') }}</span>
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
    margin-top: 20px;
    padding: 10px;
    background-color: var(--danger-light);
    color: var(--danger-dark);
    border: 1px solid #f5c6cb;
    border-radius: 4px;
  }
</style>
