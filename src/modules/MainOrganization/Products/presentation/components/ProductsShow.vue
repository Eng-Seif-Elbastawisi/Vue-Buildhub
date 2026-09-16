<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';

  import { useRoute, useRouter } from 'vue-router';

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

  const productsId = Number(route.params.products_id);

  const loading = ref(false);

  const product = computed(() => controller.itemData.value ?? undefined);

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

  const goBack = () => {
    router.push('/organization/products');
  };

  const goEdit = () => {
    router.push(`/organization/products/edit/${productsId}`);
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
      <!-- Header -->
      <ProductShowHeader
        :product="product"
        :products-id="productsId"
        @back="goBack"
        @edit="goEdit"
      />

      <!-- Hero -->
      <ProductShowHero :product="product" />

      <!-- Content -->
      <div class="content-grid">
        <ProductShowInfo :product="product" />

        <ProductShowSortings :product-id="product.id" :sortings="product.sortings" />

        <ProductShowStages
          :product-id="product.id"
          :stages="product.stages"
          :stage-ids="product.stageIds"
        />

        <ProductShowDescription :translations="product.translations" />
      </div>
    </template>

    <!-- Error / Empty -->
    <div v-else class="state-box">
      <div class="empty-icon">📦</div>

      <h3>
        {{ $t('Products.show.no_data') || 'لا توجد بيانات' }}
      </h3>

      <p v-if="controller.errorMessage.value">
        {{ controller.errorMessage.value }}
      </p>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .show-page {
    min-height: 100vh;

    padding: 1.5rem 1.75rem 2.5rem;

    background: #f8fafc;
  }

  .content-grid {
    display: grid;

    grid-template-columns:
      minmax(0, 1fr)
      minmax(0, 1fr);

    gap: 1.25rem;
  }

  .state-box {
    min-height: 60vh;

    display: flex;
    flex-direction: column;

    align-items: center;
    justify-content: center;

    gap: 0.75rem;

    color: #64748b;

    .spinner {
      width: 36px;
      height: 36px;

      border: 3px solid #e2e8f0;
      border-top-color: #b45309;

      border-radius: 50%;

      animation: spin 0.8s linear infinite;
    }

    .empty-icon {
      font-size: 2.5rem;
    }

    h3 {
      margin: 0;

      color: #0f172a;
    }
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 1000px) {
    .content-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 700px) {
    .show-page {
      padding: 1rem;
    }
  }
</style>
