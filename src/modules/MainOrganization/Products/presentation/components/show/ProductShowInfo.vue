<script setup lang="ts">
import type ProductsShowModel from '../../../data/models/products.show.model.ts';

defineProps<{
  product: ProductsShowModel;
}>();

const formatPrice = (
  price?: number | string,
) => {
  if (
    price == null ||
    price === ''
  ) {
    return '—';
  }

  return new Intl.NumberFormat(
    'ar-EG',
  ).format(Number(price));
};
</script>

<template>
  <section class="card">
    <div class="card-header">
      <div class="card-title-wrap">
        <span class="num">
          01
        </span>

        <div>
          <h3>
            {{
              $t(
                'Products.form.product_data',
              ) ||
              'بيانات المنتج'
            }}
          </h3>

          <p>
            {{
              $t(
                'Products.show.subtitle',
              ) ||
              'المعلومات الأساسية'
            }}
          </p>
        </div>
      </div>
    </div>

    <div class="info-grid">
      <div class="info-item full">
        <span class="label">
          {{
            $t(
              'Products.form.product_name',
            ) ||
            'اسم المنتج'
          }}
        </span>

        <span class="value">
          {{
            product.translations?.title?.ar ||
            product.translations?.title?.en ||
            '—'
          }}
        </span>

        <span
          v-if="
            product.translations?.title?.en &&
            product.translations?.title?.ar
          "
          class="sub-value"
        >
          {{ product.translations.title.en }}
        </span>
      </div>

      <div class="info-item">
        <span class="label">
          {{ $t('item_type') || 'نوع المنتج' }}
        </span>

        <span class="value">
          {{ product.itemTypeTitle || '—' }}
        </span>
      </div>

      <div class="info-item">
        <span class="label">
          {{ $t('measurement') || 'وحدة القياس' }}
        </span>

        <span class="value">
          {{ product.measurementUnitTitle || '—' }}
        </span>
      </div>

      <div class="info-item">
        <span class="label">
          {{
            $t(
              'Products.form.expected_price',
            ) ||
            'السعر المتوقع'
          }}
        </span>

        <span class="value price">
          {{ formatPrice(product.expectedPrice) }}
        </span>
      </div>

      <div class="info-item">
        <span class="label">
          {{
            $t(
              'Products.form.active',
            ) ||
            'الحالة'
          }}
        </span>

        <span
          class="status-pill"
          :class="
            product.isActive
              ? 'active'
              : 'inactive'
          "
        >
          <span class="dot"></span>

          {{
            product.isActive
              ? $t('Products.form.active')
              : $t('Products.form.inactive')
          }}
        </span>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.card {
  padding: 1.35rem;

  background: white;

  border: 1px solid #e2e8f0;

  border-radius: 1rem;

  box-shadow:
    0 1px 3px rgb(0 0 0 / 0.04);
}

.card-header {
  display: flex;

  justify-content: space-between;

  align-items: flex-start;

  margin-bottom: 1.25rem;
}

.card-title-wrap {
  display: flex;

  align-items: center;

  gap: 0.75rem;

  .num {
    width: 34px;
    height: 34px;

    display: flex;

    align-items: center;

    justify-content: center;

    border-radius: 0.5rem;

    background: #fff7ed;

    color: #b45309;

    font-size: 0.75rem;

    font-weight: 800;
  }

  h3 {
    margin: 0;

    font-size: 1.05rem;

    font-weight: 700;

    color: #0f172a;
  }

  p {
    margin: 0.15rem 0 0;

    font-size: 0.8rem;

    color: #64748b;
  }
}

.info-grid {
  display: grid;

  grid-template-columns:
    1fr
    1fr;

  gap: 0.75rem;
}

.info-item {
  display: flex;

  flex-direction: column;

  gap: 0.25rem;

  padding: 0.85rem 1rem;

  background: #f8fafc;

  border: 1px solid #e2e8f0;

  border-radius: 0.7rem;

  &.full {
    grid-column: 1 / -1;
  }
}

.label {
  font-size: 0.75rem;

  color: #64748b;
}

.value {
  font-size: 0.95rem;

  font-weight: 700;

  color: #0f172a;

  &.price {
    color: #0f766e;
  }
}

.sub-value {
  font-size: 0.8rem;

  color: #94a3b8;
}

.status-pill {
  display: inline-flex;

  align-items: center;

  gap: 0.35rem;

  width: fit-content;

  padding: 0.25rem 0.65rem;

  border-radius: 999px;

  font-size: 0.75rem;

  font-weight: 600;

  .dot {
    width: 6px;
    height: 6px;

    border-radius: 50%;

    background: currentColor;
  }

  &.active {
    background: #d1fae5;

    color: #065f46;
  }

  &.inactive {
    background: #fee2e2;

    color: #991b1b;
  }
}

@media (max-width: 600px) {
  .info-grid {
    grid-template-columns: 1fr;
  }

  .info-item.full {
    grid-column: auto;
  }
}
</style>