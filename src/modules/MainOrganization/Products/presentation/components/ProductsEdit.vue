<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import ConfirmCancelDialog from '@/base/Presentation/Dialogs/ConfirmCancelDialog.vue';

  import type AddProductsParams from '../../core/params/add.products.params.ts';
  import type EditProductsParams from '../../core/params/edit.products.params.ts';
  import ShowProductsParams from '../../core/params/show.products.params.ts';

  import ProductsController from '../controllers/products.controller.ts';
  import ProductsForm from './ProductsForm.vue';

  const controller = ProductsController.getInstance();
  const route = useRoute();
  const router = useRouter();

  const productsId = Number(route.params.products_id);

  const params = ref<EditProductsParams | AddProductsParams | null>(null);
  const loading = ref(false);
  const goBack = () => void router.push({ name: 'Products' });

  const saveProducts = async () => {
    if (!params.value) return;

    loading.value = true;

    try {
      await controller.update(params.value, undefined, route.fullPath);
    } finally {
      loading.value = false;
    }
  };

  const updateData = (data: EditProductsParams) => {
    params.value = data;
  };

  onMounted(async () => {
    loading.value = true;

    try {
      await controller.fetchOne(
        new ShowProductsParams({
          productsId,
          allLocales: true,
        }),
      );
    } finally {
      loading.value = false;
    }
  });
</script>

<template>
  <div class="Products-crud-page">
    <ProductsForm
      v-if="controller.itemData.value"
      :products="controller.itemData.value"
      :loading="loading"
      @update-data="updateData"
    />

    <div class="form-actions form-action-pair">
      <button
        :class="{ 'btn--loading': loading }"
        class="btn btn-primary"
        type="button"
        :disabled="loading || !params"
        @click="saveProducts"
      >
        {{ $t('update') }}
      </button>
      <ConfirmCancelDialog
        :title="$t('cancel_changes')"
        :message="$t('are_you_sure_you_want_to_leave')"
        :trigger-label="$t('common.back')"
        trigger-class="back-button"
        @confirm="goBack"
      />
    </div>

    <div v-if="controller.errorMessage.value" class="error">
      {{ controller.errorMessage.value }}
    </div>
  </div>
</template>

<style scoped lang="scss">
  @use '@/styles/mixins/form_action_pair' as form-actions;

  .Products-crud-page {
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

  .form-action-pair {
    @include form-actions.layout;
  }
</style>
