<script setup lang="ts">
import type ProductsShowModel from '../../../data/models/products.show.model.ts';

defineProps<{
  product: ProductsShowModel;
  productsId: number;
}>();

const emit = defineEmits<{
  back: [];
  edit: [];
}>();
</script>

<template>
  <header class="page-header">
    <div class="header-right">
      <div class="breadcrumb">
        <span>
          {{ $t('Products.badge') }}
        </span>

        <span class="sep">
          /
        </span>

        <span>
          {{ $t('Products.show.subtitle') }}
        </span>
      </div>

      <h1 class="title">
        {{
          product.translations?.title?.ar ||
          product.translations?.title?.en ||
          '—'
        }}
      </h1>

      <div class="meta">
        <span class="id">
          #{{ product.id ?? productsId }}
        </span>

        <span
          class="status"
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

    <div class="header-actions">
      <button
        class="btn btn-ghost"
        type="button"
        @click="emit('back')"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M19 12H5" />
          <path d="M12 19l-7-7 7-7" />
        </svg>

        {{ $t('common.back') }}
      </button>

      <button
        class="btn btn-primary"
        type="button"
        @click="emit('edit')"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
          />

          <path
            d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
          />
        </svg>

        {{ $t('common.edit') }}
      </button>
    </div>
  </header>
</template>

<style scoped lang="scss">
.page-header {
  display: flex;

  justify-content: space-between;
  align-items: flex-start;

  gap: 1.5rem;

  margin-bottom: 1.5rem;
}

.header-right {
  min-width: 0;
}

.breadcrumb {
  display: flex;
  align-items: center;

  gap: 0.4rem;

  margin-bottom: 0.35rem;

  font-size: 0.8rem;

  color: #64748b;

  .sep {
    opacity: 0.5;
  }
}

.title {
  margin: 0;

  font-size: clamp(
    1.4rem,
    2.2vw,
    1.75rem
  );

  font-weight: 800;

  color: #0f172a;

  line-height: 1.3;
}

.meta {
  display: flex;

  align-items: center;

  gap: 0.75rem;

  margin-top: 0.5rem;
}

.id {
  font-size: 0.8rem;

  color: #64748b;
}

.status {
  display: inline-flex;

  align-items: center;

  gap: 0.35rem;

  padding: 0.2rem 0.65rem;

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

.header-actions {
  display: flex;

  gap: 0.6rem;

  flex-shrink: 0;
}

.btn {
  display: inline-flex;

  align-items: center;

  justify-content: center;

  gap: 0.4rem;

  height: 40px;

  padding: 0 1.1rem;

  border-radius: 0.6rem;

  font-size: 0.875rem;

  font-weight: 600;

  cursor: pointer;

  transition: 0.15s;

  &.btn-ghost {
    background: white;

    color: #475569;

    border: 1px solid #e2e8f0;

    &:hover {
      background: #f8fafc;

      border-color: #cbd5e1;
    }
  }

  &.btn-primary {
    background: #b45309;

    color: white;

    border: 0;

    &:hover {
      background: #92400e;
    }
  }
}

@media (max-width: 700px) {
  .page-header {
    flex-direction: column;
  }

  .header-actions {
    width: 100%;

    .btn {
      flex: 1;
    }
  }
}
</style>