<script setup lang="ts">
  import ConfirmCancelDialog from '@/base/Presentation/Dialogs/ConfirmCancelDialog.vue';

  import type ProductsShowModel from '../../../core/models/products.show.model';

  defineProps<{
    product: ProductsShowModel;
    deleting?: boolean;
  }>();

  const emit = defineEmits<{
    back: [];
    edit: [];
    delete: [];
  }>();
</script>

<template>
  <header class="page-header">
    <div class="header-copy">
      <nav class="breadcrumb" :aria-label="$t('Products.breadcrumb_label')">
        <router-link to="/">{{ $t('home') }}</router-link>
        <span aria-hidden="true">/</span>
        <router-link to="/organization/products">{{ $t('Products.page_title') }}</router-link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{{ $t('Products.show.details_title') }}</span>
      </nav>

      <div class="heading-row">
        <h1>{{ $t('Products.show.details_title') }}</h1>
        <span class="product-code">#{{ product.code || '—' }}</span>
      </div>
    </div>

    <div class="header-actions">
      <button class="header-btn header-btn--ghost" type="button" @click="emit('back')">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M19 12H5" />
          <path d="m12 19-7-7 7-7" />
        </svg>
        {{ $t('Products.form.back') }}
      </button>

      <button class="header-btn header-btn--primary" type="button" @click="emit('edit')">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
        {{ $t('common.edit') }}
      </button>

      <ConfirmCancelDialog
        :title="$t('Products.delete_dialog.title')"
        :message="$t('Products.delete_dialog.message')"
        :confirm-label="$t('confirm')"
        :cancel-label="$t('cancel')"
        confirm-theme="danger"
        :disabled="deleting"
        @confirm="emit('delete')"
      >
        <template #trigger="{ open }">
          <button
            class="header-btn header-btn--danger"
            type="button"
            :disabled="deleting"
            @click="open"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v5M14 11v5" />
            </svg>
            {{ deleting ? $t('common.loading') : $t('common.delete') }}
          </button>
        </template>
      </ConfirmCancelDialog>
    </div>
  </header>
</template>

<style scoped lang="scss">
  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    min-width: 0;
    padding-block: 0.1rem 0.35rem;
  }

  .header-copy {
    min-width: 0;
  }

  .breadcrumb {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.4rem;
    color: var(--gray-400);
    font-size: var(--xs-size);

    a {
      color: var(--gray-500);
      text-decoration: none;

      &:hover {
        color: var(--PrimaryColor);
      }
    }

    [aria-current='page'] {
      color: var(--PrimaryColor);
      font-weight: 600;
    }
  }

  .heading-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-top: 0.45rem;

    h1 {
      margin: 0;
      color: var(--title-color);
      font-size: clamp(1.35rem, 2vw, 1.8rem);
      font-weight: 800;
      line-height: 1.3;
    }
  }

  .product-code {
    padding: 0.3rem 0.55rem;
    color: var(--gray-600);
    background: var(--gray-100);
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-sm);
    font-size: var(--xs-size);
    font-weight: 700;
    direction: ltr;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    flex-shrink: 0;
  }

  .header-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    min-height: 2.5rem;
    padding: 0.55rem 0.9rem;
    border-radius: var(--radius-sm);
    font-size: var(--sm-size);
    font-weight: 700;
    cursor: pointer;
    transition: var(--transition-fast);

    &:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }

    &:focus-visible {
      outline: 2px solid var(--PrimaryColor);
      outline-offset: 2px;
    }

    &--ghost {
      color: var(--gray-700);
      background: var(--bg-card);
      border: 1px solid var(--border-weak);

      &:hover {
        border-color: var(--border-strong);
        background: var(--gray-50);
      }
    }

    &--primary {
      color: var(--standard-white);
      background: var(--PrimaryColor);
      border: 1px solid var(--PrimaryColor);

      &:hover {
        background: var(--PrimaryColor-hover);
        border-color: var(--PrimaryColor-hover);
      }
    }

    &--danger {
      color: var(--danger);
      background: var(--bg-card);
      border: 1px solid var(--danger);

      &:hover:not(:disabled) {
        color: var(--standard-white);
        background: var(--danger);
      }
    }
  }

  @media (max-width: 760px) {
    .page-header {
      align-items: stretch;
      flex-direction: column;
    }

    .header-actions {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .header-btn {
      width: 100%;
    }
  }

  @media (max-width: 480px) {
    .header-actions {
      grid-template-columns: 1fr;
    }
  }
</style>
