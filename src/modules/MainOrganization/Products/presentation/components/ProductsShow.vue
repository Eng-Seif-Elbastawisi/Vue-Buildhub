<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { useI18n } from 'vue-i18n';

  import { useRoute, useRouter } from 'vue-router';

  import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import { dialogManager } from '@/base/Presentation/Dialogs/dialog.manager';

  import DeleteProductsParams from '../../core/params/delete.products.params.ts';
  import ShowProductsParams from '../../core/params/show.products.params.ts';
  import ProductsController from '../controllers/products.controller.ts';

  import ProductShowHeader from './show/ProductShowHeader.vue';
  import ProductShowHero from './show/ProductShowHero.vue';
  import ProductShowInfo from './show/ProductShowInfo.vue';
  import ProductShowSortings from './show/ProductShowSortings.vue';
  import ProductShowStages from './show/ProductShowStages.vue';
  import ProductShowDescription from './show/ProductShowDescription.vue';

  const controller = ProductsController.getInstance();

  const route = useRoute();
  const router = useRouter();
  const { t } = useI18n();

  const productsId = Number(route.params.products_id);

  const loading = ref(false);
  const deleting = ref(false);

  const product = computed(() => controller.itemData.value ?? undefined);

  onMounted(async () => {
    loading.value = true;

    try {
      await controller.fetchOne(
        new ShowProductsParams({
          productsId,
          allLocales: false,
        }),
      );
    } finally {
      loading.value = false;
    }
  });

  const goBack = () => {
    router.push('/organization/products');
  };

  const goEdit = () => {
    router.push(`/organization/products/edit/${productsId}`);
  };

  const deleteProduct = async () => {
    if (deleting.value) return;

    deleting.value = true;

    try {
      const deletionState = await controller.delete(
        new DeleteProductsParams({
          productsId,
        }),
      );

      if (!(deletionState instanceof DataSuccess)) return;

      dialogManager.toastSuccess(deletionState.message || t('Products.delete_success'));
      await router.push('/organization/products');
    } finally {
      deleting.value = false;
    }
  };
</script>

<template>
  <div class="show-page">
    <!-- Loading -->
    <div v-if="loading" class="state-box">
      <div class="spinner"></div>

      <span>
        {{ $t('loading') }}
      </span>
    </div>

    <!-- Product -->
    <template v-else-if="product">
      <ProductShowHeader
        :product="product"
        :deleting="deleting"
        @back="goBack"
        @edit="goEdit"
        @delete="deleteProduct"
      />

      <ProductShowHero :product="product" :title="product.title" />

      <div class="content-stack">
        <ProductShowInfo :product="product" :title="product.title" />

        <ProductShowSortings :product-id="productsId" :sortings="product.sortings" />

        <ProductShowStages
          :product-id="productsId"
          :stages="product.stages"
          :stage-ids="product.stageIds"
        />

        <ProductShowDescription :description="product.description" />
      </div>
    </template>

    <div v-else class="state-box">
      <svg
        class="empty-icon"
        width="38"
        height="38"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.6"
        aria-hidden="true"
      >
        <path
          d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
        />
        <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
      </svg>

      <h3>
        {{ $t('Products.show.no_data') }}
      </h3>

      <p v-if="controller.errorMessage.value">
        {{ controller.errorMessage.value }}
      </p>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .show-page {
    display: flex;
    min-height: 100%;
    flex-direction: column;
    gap: 1rem;
    padding: clamp(1rem, 2vw, 1.75rem);
    background: var(--bg-section);
    border-radius: var(--radius-xl);
  }

  .content-stack {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .state-box {
    min-height: 60vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    color: var(--subtitle-color);

    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid var(--border-weak);
      border-top-color: var(--PrimaryColor);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .empty-icon {
      box-sizing: content-box;
      padding: 0.85rem;
      color: var(--PrimaryColor);
      background: var(--PrimaryColor-light);
      border-radius: var(--radius-md);
    }

    h3 {
      margin: 0;
      color: var(--title-color);
    }
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 700px) {
    .show-page {
      padding: 1rem;
    }
  }
</style>
