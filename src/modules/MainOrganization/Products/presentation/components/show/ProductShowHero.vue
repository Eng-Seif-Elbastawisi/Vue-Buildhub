<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import type ProductsShowModel from '../../../core/models/products.show.model';

  defineProps<{
    product: ProductsShowModel;
    title?: string;
  }>();
  const { locale } = useI18n();

  const formatPrice = (price?: number | string) => {
    if (price == null || price === '') {
      return '—';
    }

    return new Intl.NumberFormat('ar-EG').format(Number(price));
  };
</script>

<template>
  <section class="hero-card">
    <div class="hero-image">
      <img
        v-if="product.image"
        :src="product.image"
        :alt="product.translations?.title?.ar || product.translations?.title?.en || ''"
      />

      <div v-else class="placeholder">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path
            d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
          />

          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />

          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>

        <span>
          {{ $t('Products.show.no_image') }}
        </span>
      </div>
    </div>

    <div class="hero-info">
      <h2 class="product-name">
        {{ title }}
      </h2>
      <div class="price-row">
        <span class="price">
          {{ formatPrice(product.expectedPrice) }}
        </span>

        <span class="currency">
          {{ $t('Products.form.currency') }}

          {{ product.measurementUnit?.title }}
        </span>
      </div>

      <div class="chips">
        <div class="chip">
          <span class="chip-label">
            {{ $t('item_type') }}
          </span>

          <span class="chip-value">
            {{ product.itemType?.title || '—' }}
          </span>
        </div>

        <div class="chip">
          <span class="chip-label">
            {{ $t('measurement') }}
          </span>

          <span class="chip-value">
            {{ product.measurementUnit?.title || '—' }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
  .hero-card {
    display: grid;

    grid-template-columns:
      280px
      minmax(0, 1fr);

    gap: 1.75rem;

    margin-bottom: 1.5rem;

    padding: 1.5rem;

    background: white;

    border: 1px solid #e2e8f0;

    border-radius: 1.1rem;

    box-shadow: 0 1px 3px rgb(0 0 0 / 0.04);
  }

  .hero-image {
    aspect-ratio: 1;

    overflow: hidden;

    display: flex;

    align-items: center;

    justify-content: center;

    border-radius: 0.85rem;

    background: linear-gradient(135deg, #f1f5f9, #e2e8f0);

    img {
      width: 100%;
      height: 100%;

      object-fit: cover;
    }
  }

  .placeholder {
    display: flex;

    flex-direction: column;

    align-items: center;

    gap: 0.6rem;

    color: #94a3b8;

    font-size: 0.85rem;
  }

  .hero-info {
    display: flex;

    flex-direction: column;

    justify-content: center;

    gap: 1rem;
  }

  .product-name {
    margin: 0;

    font-size: 1.5rem;

    font-weight: 800;

    color: #0f172a;

    line-height: 1.35;
  }

  .price-row {
    display: flex;

    align-items: baseline;

    gap: 0.5rem;

    .price {
      font-size: 1.75rem;

      font-weight: 800;

      color: #0f766e;
    }

    .currency {
      font-size: 0.9rem;

      color: #64748b;
    }
  }

  .chips {
    display: flex;

    flex-wrap: wrap;

    gap: 0.75rem;
  }

  .chip {
    display: flex;

    flex-direction: column;

    gap: 0.15rem;

    padding: 0.55rem 0.9rem;

    background: #f8fafc;

    border: 1px solid #e2e8f0;

    border-radius: 0.65rem;

    .chip-label {
      font-size: 0.7rem;

      color: #64748b;
    }

    .chip-value {
      font-size: 0.9rem;

      font-weight: 600;

      color: #0f172a;
    }
  }

  @media (max-width: 700px) {
    .hero-card {
      grid-template-columns: 1fr;
    }

    .hero-image {
      max-width: 260px;

      margin: auto;
    }
  }
</style>
