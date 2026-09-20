<script setup lang="ts">
  import { ref } from 'vue';
  import { useRoute } from 'vue-router';
  import type AddMaterialsParams from '../../core/params/add.materials.params';
  import MaterialController from '../controllers/materials.controller';
  import MaterialsForm from './MaterialsForm.vue';

  const controller = MaterialController.getInstance();
  const route = useRoute();
  const formKey = route.fullPath;
  const params = ref<AddMaterialsParams | null>(null);
  const loading = ref(false);

  const updateData = (updatedParams: AddMaterialsParams) => {
    params.value = updatedParams;
  };

  const saveMaterial = async () => {
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
  <div class="material-crud-page">
    <MaterialsForm :form-key="formKey" :loading="loading" @update-data="updateData" />

    <div class="actions" :class="{ disabled: loading }">
      <button
        :disabled="loading"
        :class="{ 'btn--loading': loading }"
        class="btn btn-primary w-full"
        type="button"
        @click="saveMaterial"
      >
        <span v-if="loading" class="loader"></span>
        <span v-else>{{ $t('material.save') }}</span>
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
