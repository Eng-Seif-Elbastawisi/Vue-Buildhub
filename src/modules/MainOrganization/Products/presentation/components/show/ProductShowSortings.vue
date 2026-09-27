<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { useI18n } from 'vue-i18n';

  import ConfirmCancelDialog from '@/base/Presentation/Dialogs/ConfirmCancelDialog.vue';
  import type ProductShowSortingModel from '../../../core/models/ProductShowSortingModel';

  import DeleteProductsSortingParams from '../../../core/params/delete.products.sorting.params.ts';
  import StoreProductsSortingParams from '../../../core/params/store.products.sorting.params.ts';

  import ProductsController from '../../controllers/products.controller.ts';
  const { t } = useI18n();

  // ======================================================
  // Props
  // ======================================================

  const props = defineProps<{
    productId: number;
    sortings: ProductShowSortingModel[];
  }>();

  // ======================================================
  // Controller
  // ======================================================

  const productsController = ProductsController.getInstance();

  interface MutationResponse {
    data?: {
      status?: boolean;
    } | null;
  }

  const mutationSucceeded = (result: unknown) =>
    (result as MutationResponse | null)?.data?.status === true;

  // ======================================================
  // State
  // ======================================================

  const deletingSortingId = ref<number | undefined>();

  const showSortingDialog = ref(false);

  const storingSorting = ref(false);

  const sortingPrice = ref<number | null>(null);

  /**
   * Sortings جديدة لسه مش محفوظة
   */
  const newSortings = ref<ProductShowSortingModel[]>([]);

  // ======================================================
  // Computed
  // ======================================================

  const displayedSortings = computed(() => [...(props.sortings ?? []), ...newSortings.value]);

  // ======================================================
  // Helpers
  // ======================================================

  const getSortingTitle = (index: number): string => {
    return `${t('Products.form.sorting')} ${index + 1}`;
  };

  const formatPrice = (price?: number | string) => {
    if (price == null || price === '') {
      return '—';
    }

    return new Intl.NumberFormat('ar-EG').format(Number(price));
  };

  // ======================================================
  // Open Dialog
  // ======================================================

  const openSortingDialog = () => {
    sortingPrice.value = null;

    showSortingDialog.value = true;
  };

  // ======================================================
  // Close Dialog
  // ======================================================

  const closeSortingDialog = () => {
    if (storingSorting.value) {
      return;
    }

    showSortingDialog.value = false;

    sortingPrice.value = null;
  };

  // ======================================================
  // Append Sorting
  // ======================================================

  const appendSorting = () => {
    if (sortingPrice.value == null || sortingPrice.value < 0) {
      return;
    }

    /**
     * الرقم بيتحدد حسب عدد الـ sortings الموجودة
     *
     * مثال:
     * الموجود 2
     * الجديد => فرز 3
     */
    const title = getSortingTitle(displayedSortings.value.length);

    /**
     * Append محلي فقط
     * لا يوجد API request هنا
     */
    newSortings.value.push({
      title,
      price: Number(sortingPrice.value),
    });

    closeSortingDialog();
  };

  // ======================================================
  // Save Sortings
  // ======================================================

  const saveSortings = async () => {
    if (!props.productId) {
      return;
    }

    if (newSortings.value.length === 0) {
      return;
    }

    try {
      storingSorting.value = true;

      const startIndex = props.sortings?.length ?? 0;

      for (let index = 0; index < newSortings.value.length; index++) {
        const sorting = newSortings.value[index];

        if (!sorting) continue;

        const title = getSortingTitle(startIndex + index);

        const params = new StoreProductsSortingParams({
          productId: props.productId,
          title,
          price: Number(sorting.price),
        });

        const result = await productsController.storeProductSorting(params);

        if (!mutationSucceeded(result)) {
          return;
        }
      }

      newSortings.value = [];

      window.location.reload();
    } finally {
      storingSorting.value = false;
    }
  };

  // ======================================================
  // Delete Sorting
  // ======================================================

  const deleteSorting = async (sorting: ProductShowSortingModel, index: number) => {
    /**
     * Sorting جديد ولسه مش محفوظ
     * نحذفه من الـ append المحلي فقط
     */
    if (!sorting.id) {
      const newIndex = index - props.sortings.length;

      if (newIndex >= 0) {
        newSortings.value.splice(newIndex, 1);
      }

      return;
    }

    /**
     * Sorting موجود بالفعل في الـ API
     */
    try {
      deletingSortingId.value = sorting.id;

      const result = await productsController.deleteProductSorting(
        new DeleteProductsSortingParams({
          productSortingId: sorting.id,
        }),
      );

      if (mutationSucceeded(result)) {
        window.location.reload();
      }
    } finally {
      deletingSortingId.value = undefined;
    }
  };
</script>

<template>
  <section class="card">
    <!-- ================================================== -->
    <!-- Header -->
    <!-- ================================================== -->

    <div class="card-header">
      <div class="card-title-wrap">
        <span class="section-icon" aria-hidden="true">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="m12 2 9 5-9 5-9-5 9-5Z" />
            <path d="m3 12 9 5 9-5M3 17l9 5 9-5" />
          </svg>
        </span>

        <div>
          <h3>
            {{ $t('Products.show.sortings_title') }}
          </h3>

          <p>
            {{ $t('Products.form.sorting_prices') }}
          </p>
        </div>
      </div>

      <div class="header-actions">
        <span class="count">
          {{ displayedSortings.length }}
        </span>

        <button type="button" class="add-sorting-btn" @click="openSortingDialog">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />

            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>

          <span>
            {{ $t('common.add') }}
          </span>
        </button>
      </div>
    </div>

    <!-- ================================================== -->
    <!-- Sortings -->
    <!-- ================================================== -->

    <div v-if="displayedSortings.length" class="sortings-table">
      <div class="sorting-table-head" aria-hidden="true">
        <span>{{ $t('Products.show.sorting_number') }}</span>
        <span>{{ $t('Products.show.sorting_name') }}</span>
        <span>{{ $t('price') }}</span>
        <span>{{ $t('Products.show.actions') }}</span>
      </div>

      <div
        v-for="(sorting, index) in displayedSortings"
        :key="sorting.id ?? `new-${index}`"
        class="sorting-item"
      >
        <span class="sorting-num" :data-label="$t('Products.show.sorting_number')">
          {{ String(index + 1).padStart(2, '0') }}
        </span>

        <span class="sorting-title" :data-label="$t('Products.show.sorting_name')">
          {{ sorting.title || getSortingTitle(index) }}
        </span>

        <div class="sorting-price" :data-label="$t('price')">
          {{ formatPrice(sorting.price) }}
          <small>{{ $t('Products.form.currency') }}</small>
        </div>

        <div class="sorting-actions" :data-label="$t('Products.show.actions')">
          <ConfirmCancelDialog
            :title="$t('Products.delete_item_dialog.title')"
            :message="$t('Products.delete_item_dialog.message')"
            :confirm-label="$t('confirm')"
            :cancel-label="$t('cancel')"
            confirm-theme="danger"
            :disabled="deletingSortingId === sorting.id"
            @confirm="deleteSorting(sorting, index)"
          >
            <template #trigger="{ open }">
              <button
                type="button"
                class="delete-sorting-btn"
                :disabled="deletingSortingId === sorting.id"
                :aria-label="$t('common.delete')"
                @click="open"
              >
                <span v-if="deletingSortingId === sorting.id" class="delete-loading">
                  {{ $t('common.loading') }}
                </span>

                <svg
                  v-else
                  width="17"
                  height="17"
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
              </button>
            </template>
          </ConfirmCancelDialog>
        </div>
      </div>
    </div>

    <!-- ================================================== -->
    <!-- Empty -->
    <!-- ================================================== -->

    <div v-else class="empty-box">
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.6"
        aria-hidden="true"
      >
        <path d="m12 2 9 5-9 5-9-5 9-5Z" />
        <path d="m3 12 9 5 9-5M3 17l9 5 9-5" />
      </svg>

      <p>
        {{ $t('Products.show.no_sortings') }}
      </p>
    </div>

    <!-- ================================================== -->
    <!-- Save New Sortings -->
    <!-- ================================================== -->

    <div v-if="newSortings.length" class="sorting-save-footer">
      <button type="button" class="save-btn" :disabled="storingSorting" @click="saveSortings">
        <span v-if="storingSorting">
          {{ $t('common.loading') }}
        </span>

        <span v-else>
          {{ $t('common.save') }}
        </span>
      </button>
    </div>

    <!-- ================================================== -->
    <!-- Add Sorting Dialog -->
    <!-- ================================================== -->

    <Teleport to="body">
      <div v-if="showSortingDialog" class="dialog-overlay" @click.self="closeSortingDialog">
        <div class="sorting-dialog">
          <!-- Dialog Header -->

          <div class="dialog-header">
            <div>
              <h3>
                {{ $t('Products.form.add_sorting') }}
              </h3>

              <p>
                {{ $t('Products.form.sorting_hint') }}
              </p>
            </div>

            <button
              type="button"
              class="close-btn"
              :aria-label="$t('common.close')"
              @click="closeSortingDialog"
            >
              ×
            </button>
          </div>

          <!-- Dialog Form -->

          <div class="sorting-form">
            <!-- Sorting Name -->

            <div class="form-group">
              <label>
                {{ $t('Products.form.sorting_name') }}

                <span>*</span>
              </label>

              <div class="fixed-sorting-title">
                {{ getSortingTitle(displayedSortings.length) }}
              </div>
            </div>

            <!-- Sorting Price -->

            <div class="form-group">
              <label>
                {{ $t('Products.form.sorting_price') }}

                <span>*</span>
              </label>

              <div class="price-input-wrap">
                <input
                  v-model.number="sortingPrice"
                  type="number"
                  min="0"
                  step="1"
                  class="form-input price-input"
                  :placeholder="$t('Products.form.sorting_price_placeholder')"
                  @keyup.enter="appendSorting"
                />

                <span class="currency">
                  {{ $t('Products.form.currency') }}
                </span>
              </div>
            </div>
          </div>

          <!-- Dialog Footer -->

          <div class="dialog-footer">
            <button type="button" class="cancel-btn" @click="closeSortingDialog">
              {{ $t('common.cancel') }}
            </button>

            <button
              type="button"
              class="save-btn"
              :disabled="sortingPrice == null || sortingPrice < 0"
              @click="appendSorting"
            >
              {{ $t('common.add') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<style scoped lang="scss">
  .card {
    background: var(--bg-card);
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    overflow: hidden;
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem 1.15rem;
    border-bottom: 1px solid var(--border-weak);
  }

  .card-title-wrap {
    display: flex;
    align-items: center;
    gap: 0.7rem;
  }

  .section-icon {
    width: 2.4rem;
    height: 2.4rem;
    flex: 0 0 2.4rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-sm);
    background: var(--PrimaryColor-light);
    color: var(--PrimaryColor);
  }

  .card-title-wrap h3 {
    margin: 0 0 4px;
    font-size: var(--md-size);
    font-weight: 800;
    color: var(--title-color);
  }

  .card-title-wrap p {
    margin: 0;
    color: var(--subtitle-color);
    font-size: var(--xs-size);
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .count {
    min-width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 8px;
    border-radius: var(--radius-full);
    background: var(--gray-100);
    color: var(--gray-600);
    font-size: var(--xs-size);
    font-weight: 700;
  }

  .add-sorting-btn {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.55rem 0.8rem;
    border: 1px solid var(--PrimaryColor);
    border-radius: var(--radius-sm);
    background: var(--PrimaryColor);
    color: var(--standard-white);
    cursor: pointer;
    font-size: var(--xs-size);
    font-weight: 700;
  }

  .add-sorting-btn:hover {
    background: var(--PrimaryColor-hover);
    border-color: var(--PrimaryColor-hover);
  }

  .sortings-table {
    overflow-x: auto;
    margin: 1rem 1.15rem;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-sm);
  }

  .sorting-table-head,
  .sorting-item {
    display: grid;
    grid-template-columns: 5rem minmax(12rem, 1fr) minmax(8rem, 0.45fr) 5rem;
    align-items: center;
    gap: 0.75rem;
    min-width: 36rem;
  }

  .sorting-table-head {
    padding: 0.7rem 0.85rem;
    color: var(--gray-600);
    background: var(--gray-50);
    border-bottom: 1px solid var(--border-weak);
    font-size: var(--xs-size);
    font-weight: 700;
  }

  .sorting-item {
    padding: 0.75rem 0.85rem;
    border-bottom: 1px solid var(--border-weak);
  }

  .sorting-item:last-child {
    border-bottom: 0;
  }

  .sorting-num {
    color: var(--gray-400);
    font-size: var(--xs-size);
    font-weight: 700;
  }

  .sorting-title {
    overflow: hidden;
    color: var(--title-card-color);
    font-size: var(--sm-size);
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .sorting-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  .sorting-price {
    color: var(--title-card-color);
    font-size: var(--sm-size);
    font-weight: 800;
    white-space: nowrap;
  }

  .sorting-price small {
    margin-inline-start: 4px;
    color: var(--PrimaryColor);
    font-size: var(--xs-size-2);
    font-weight: 500;
  }

  .delete-sorting-btn {
    width: 34px;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-sm);
    background: var(--bg-card);
    color: var(--danger);
    cursor: pointer;
  }

  .delete-sorting-btn:hover {
    background: var(--danger-light);
    border-color: var(--danger);
  }

  .delete-sorting-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .delete-loading {
    font-size: var(--xs-size-2);
    font-weight: 700;
  }

  .empty-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-height: 150px;
    color: var(--gray-400);
  }

  .empty-box p {
    margin: 0;
    font-size: var(--xs-size);
  }

  .sorting-save-footer {
    display: flex;
    justify-content: flex-end;
    padding: 1rem 1.15rem;
    border-top: 1px solid var(--border-weak);
  }

  .save-btn {
    min-width: 110px;
    padding: 10px 18px;
    border: 0;
    border-radius: var(--radius-sm);
    background: var(--PrimaryColor);
    color: var(--standard-white);
    cursor: pointer;
    font-size: var(--xs-size);
    font-weight: 600;
  }

  .save-btn:hover {
    opacity: 0.9;
  }

  .save-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* ======================================================
   Dialog
   ====================================================== */

  .dialog-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: var(--gray-800-alpha-80);
  }

  .sorting-dialog {
    width: 100%;
    max-width: 500px;
    overflow: hidden;
    border-radius: var(--radius-lg);
    background: var(--bg-card);
    border: 1px solid var(--border-weak);
    box-shadow: var(--shadow-xl);
  }

  .dialog-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    padding: 22px 24px;
    border-bottom: 1px solid var(--border-weak);
  }

  .dialog-header h3 {
    margin: 0 0 6px;
    color: var(--title-color);
    font-size: 18px;
    font-weight: 700;
  }

  .dialog-header p {
    margin: 0;
    color: var(--subtitle-color);
    font-size: 13px;
  }

  .close-btn {
    width: 32px;
    height: 32px;
    border: 0;
    border-radius: var(--radius-sm);
    background: var(--gray-100);
    color: var(--gray-600);
    cursor: pointer;
    font-size: 22px;
    line-height: 1;
  }

  .close-btn:hover {
    background: var(--gray-200);
  }

  .sorting-form {
    display: flex;
    flex-direction: column;
    gap: 18px;
    padding: 24px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .form-group label {
    color: var(--gray-700);
    font-size: 13px;
    font-weight: 600;
  }

  .form-group label span {
    color: var(--danger);
  }

  .fixed-sorting-title {
    width: 100%;
    box-sizing: border-box;
    padding: 11px 13px;
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-sm);
    background: var(--gray-50);
    color: var(--gray-700);
    font-size: 13px;
    font-weight: 600;
  }

  .form-input {
    width: 100%;
    box-sizing: border-box;
    padding: 11px 13px;
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-sm);
    outline: none;
    color: var(--title-card-color);
    background: var(--bg-card);
    font-size: 13px;
  }

  .form-input:focus {
    border-color: var(--PrimaryColor);
    box-shadow: 0 0 0 3px var(--PrimaryColor-alpha-15);
  }

  .price-input-wrap {
    position: relative;
  }

  .price-input {
    padding-inline-end: 65px;
  }

  .currency {
    position: absolute;
    top: 50%;
    inset-inline-end: 13px;
    transform: translateY(-50%);
    color: var(--subtitle-color);
    font-size: 12px;
    pointer-events: none;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 16px 24px;
    border-top: 1px solid var(--border-weak);
  }

  .cancel-btn {
    padding: 10px 18px;
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-sm);
    background: var(--bg-card);
    color: var(--gray-700);
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
  }

  .cancel-btn:hover {
    background: var(--gray-50);
  }

  @media (max-width: 640px) {
    .card-header {
      align-items: flex-start;
      flex-direction: column;
    }

    .header-actions {
      width: 100%;
      justify-content: space-between;
    }

    .sorting-item {
      min-width: 0;
      grid-template-columns: 1fr auto;
      gap: 0.5rem 1rem;
    }

    .sorting-table-head {
      display: none;
    }

    .sorting-num,
    .sorting-title,
    .sorting-price,
    .sorting-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;

      &::before {
        content: attr(data-label);
        color: var(--gray-500);
        font-size: var(--xs-size-2);
        font-weight: 500;
      }
    }

    .sorting-title,
    .sorting-price {
      grid-column: 1 / -1;
    }

    .sorting-actions {
      grid-column: 1 / -1;
      justify-content: flex-end;
    }
  }
</style>
