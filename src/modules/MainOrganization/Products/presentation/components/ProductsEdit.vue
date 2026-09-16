<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import type AddProductsParams from '../../core/params/add.products.params.ts';
import EditProductsParams from '../../core/params/edit.products.params.ts';
import ShowProductsParams from '../../core/params/show.products.params.ts';
import ProductsController from '../controllers/products.controller.ts';

import ProductsForm from './ProductsForm.vue';

// ======================================================
// Setup
// ======================================================
const controller = ProductsController.getInstance();
const route = useRoute();

const productsId = Number(route.params.products_id);
const params = ref<EditProductsParams | null>(null);
const loading = ref(false);

const product = computed(() => controller.itemData.value ?? undefined);

// ======================================================
// Handle Form Data
// ======================================================
const updateData = (data: AddProductsParams) => {
  params.value = new EditProductsParams({
    productsId,
    translations: data.translations,
    itemTypeId: data.itemTypeId,
    measurementUnitId: data.measurementUnitId,
    expectedPrice: data.expectedPrice,
    image: data.image,
    stageIds: data.stageIds,
    sortings: data.sortings,
  });
};

// ======================================================
// Save
// ======================================================
const saveProducts = async () => {
  if (!params.value) return;

  const result = params.value.validate();
  if (!result.isValid) {
    console.warn('Validation errors:', result.errors);
    return;
  }

  loading.value = true;
  try {
    await controller.update(params.value, undefined, route.fullPath);
  } finally {
    loading.value = false;
  }
};

// ======================================================
// Fetch Product
// ======================================================
onMounted(async () => {
  loading.value = true;
  try {
    await controller.fetchOne(
      new ShowProductsParams({ productsId, allLocales: true }),
    );
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="products-edit-page">
    <!-- Form -->
    <ProductsForm
      v-if="product"
      :Products="product"
      :loading="loading"
      @update-data="updateData"
    />

    <!-- Save Button -->
    <button
      class="btn btn-primary"
      :class="{ 'btn--loading': loading }"
      type="button"
      :disabled="loading || !params"
      @click="saveProducts"
    >
      {{ $t('Products.form.update') }}
    </button>

    <!-- Error -->
    <div v-if="controller.errorMessage.value" class="error">
      {{ controller.errorMessage.value }}
    </div>
  </div>
</template>

<style scoped>
.products-edit-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.btn-primary {
  width: 100%;
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