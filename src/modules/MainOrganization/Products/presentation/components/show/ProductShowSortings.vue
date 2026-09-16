<script setup lang="ts">
  import { computed, ref } from 'vue';

  import type { ProductShowSorting } from '../../../core/models/products.show.model.ts';

  import DeleteProductsSortingParams from '../../../core/params/delete.products.sorting.params.ts';
  import StoreProductsSortingParams from '../../../core/params/store.products.sorting.params.ts';

  import ProductsController from '../../controllers/products.controller.ts';
  import { useI18n } from 'vue-i18n';
  const { t } = useI18n();

  // ======================================================
  // Props
  // ======================================================

  const props = defineProps<{
    productId: number;
    sortings: ProductShowSorting[];
  }>();

  // ======================================================
  // Controller
  // ======================================================

  const productsController = ProductsController.getInstance();

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
  const newSortings = ref<ProductShowSorting[]>([]);

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
    console.log('SAVE CLICKED');
    console.log('productId:', props.productId);
    console.log('newSortings:', newSortings.value);

    if (!props.productId) {
      console.log('STOP: productId is missing');
      return;
    }

    if (newSortings.value.length === 0) {
      console.log('STOP: no new sortings');
      return;
    }

    try {
      storingSorting.value = true;

      const startIndex = props.sortings?.length ?? 0;

      for (let index = 0; index < newSortings.value.length; index++) {
        const sorting = newSortings.value[index];

        const title = getSortingTitle(startIndex + index);

        const params = new StoreProductsSortingParams({
          productId: props.productId,
          title,
          price: Number(sorting.price),
        });

        console.log('SAVE PARAMS:', params);
        console.log('SAVE MAP:', params.toMap());

        const result = await productsController.storeProductSorting(params);

        console.log('SAVE RESULT:', result);
        console.log('SAVE STATUS:', result?.data?.status);

        if (result?.data?.status !== true) {
          console.log('SAVE FAILED');
          return;
        }
      }

      console.log('ALL SORTINGS SAVED');

      newSortings.value = [];

      window.location.reload();
    } finally {
      storingSorting.value = false;
    }
  };

  // ======================================================
  // Delete Sorting
  // ======================================================

  const deleteSorting = async (sorting: ProductShowSorting, index: number) => {
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

      if (result?.data?.status === true) {
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
        <span class="num">
          {{ $t('Products.form.sorting_number') }}
        </span>

        <div>
          <h3>
            {{ $t('Products.form.image_and_sorting') }}
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

    <div v-if="displayedSortings.length" class="sortings-grid">
      <div
        v-for="(sorting, index) in displayedSortings"
        :key="sorting.id ?? `new-${index}`"
        class="sorting-item"
      >
        <div class="sorting-left">
          <span class="sorting-num">
            {{ String(index + 1).padStart(2, '0') }}
          </span>

          <span class="sorting-title">
            {{ getSortingTitle(index) }}
          </span>
        </div>

        <div class="sorting-actions">
          <div class="sorting-price">
            {{ formatPrice(sorting.price) }}

            <small>
              {{ $t('Products.form.currency') }}
            </small>
          </div>

          <button
            type="button"
            class="delete-sorting-btn"
            :disabled="deletingSortingId === sorting.id"
            :aria-label="$t('common.delete')"
            @click="deleteSorting(sorting, index)"
          >
            <span v-if="deletingSortingId === sorting.id" class="delete-loading">
              {{ $t('common.loading') }}
            </span>

            <svg
              v-else
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />

              <path
                d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
              />

              <line x1="10" y1="11" x2="10" y2="17" />

              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- ================================================== -->
    <!-- Empty -->
    <!-- ================================================== -->

    <div v-else class="empty-box">
      <span>≡</span>

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
                  step="0.01"
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

<style scoped>
  .card {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    overflow: hidden;
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 20px 24px;
    border-bottom: 1px solid #e5e7eb;
  }

  .card-title-wrap {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .num {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    background: #f3f4f6;
    color: #374151;
    font-size: 14px;
    font-weight: 700;
  }

  .card-title-wrap h3 {
    margin: 0 0 4px;
    font-size: 18px;
    font-weight: 700;
    color: #111827;
  }

  .card-title-wrap p {
    margin: 0;
    color: #6b7280;
    font-size: 13px;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .count {
    min-width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 8px;
    border-radius: 8px;
    background: #f3f4f6;
    color: #374151;
    font-size: 13px;
    font-weight: 700;
  }

  .add-sorting-btn {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 9px 14px;
    border: 0;
    border-radius: 8px;
    background: #111827;
    color: #fff;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
  }

  .add-sorting-btn:hover {
    opacity: 0.9;
  }

  .sortings-grid {
    padding: 8px 24px;
  }

  .sorting-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 16px 0;
    border-bottom: 1px solid #f0f1f3;
  }

  .sorting-item:last-child {
    border-bottom: 0;
  }

  .sorting-left {
    display: flex;
    align-items: center;
    gap: 14px;
    min-width: 0;
  }

  .sorting-num {
    min-width: 34px;
    color: #9ca3af;
    font-size: 12px;
    font-weight: 700;
  }

  .sorting-title {
    color: #1f2937;
    font-size: 14px;
    font-weight: 600;
  }

  .sorting-actions {
    display: flex;
    align-items: center;
    gap: 18px;
  }

  .sorting-price {
    color: #111827;
    font-size: 14px;
    font-weight: 700;
    white-space: nowrap;
  }

  .sorting-price small {
    margin-inline-start: 4px;
    color: #6b7280;
    font-size: 11px;
    font-weight: 500;
  }

  .delete-sorting-btn {
    width: 34px;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 0;
    border-radius: 8px;
    background: #fef2f2;
    color: #dc2626;
    cursor: pointer;
  }

  .delete-sorting-btn:hover {
    background: #fee2e2;
  }

  .delete-sorting-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .delete-loading {
    font-size: 12px;
    font-weight: 700;
  }

  .empty-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 150px;
    color: #9ca3af;
  }

  .empty-box span {
    font-size: 28px;
  }

  .empty-box p {
    margin: 0;
    font-size: 13px;
  }

  .sorting-save-footer {
    display: flex;
    justify-content: flex-end;
    padding: 16px 24px;
    border-top: 1px solid #e5e7eb;
  }

  .save-btn {
    min-width: 110px;
    padding: 10px 18px;
    border: 0;
    border-radius: 8px;
    background: #111827;
    color: #fff;
    cursor: pointer;
    font-size: 13px;
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
    background: rgb(0 0 0 / 45%);
  }

  .sorting-dialog {
    width: 100%;
    max-width: 500px;
    overflow: hidden;
    border-radius: 16px;
    background: #fff;
    box-shadow: 0 20px 50px rgb(0 0 0 / 15%);
  }

  .dialog-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    padding: 22px 24px;
    border-bottom: 1px solid #e5e7eb;
  }

  .dialog-header h3 {
    margin: 0 0 6px;
    color: #111827;
    font-size: 18px;
    font-weight: 700;
  }

  .dialog-header p {
    margin: 0;
    color: #6b7280;
    font-size: 13px;
  }

  .close-btn {
    width: 32px;
    height: 32px;
    border: 0;
    border-radius: 8px;
    background: #f3f4f6;
    color: #4b5563;
    cursor: pointer;
    font-size: 22px;
    line-height: 1;
  }

  .close-btn:hover {
    background: #e5e7eb;
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
    color: #374151;
    font-size: 13px;
    font-weight: 600;
  }

  .form-group label span {
    color: #dc2626;
  }

  .fixed-sorting-title {
    width: 100%;
    box-sizing: border-box;
    padding: 11px 13px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    background: #f9fafb;
    color: #374151;
    font-size: 13px;
    font-weight: 600;
  }

  .form-input {
    width: 100%;
    box-sizing: border-box;
    padding: 11px 13px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    outline: none;
    color: #111827;
    background: #fff;
    font-size: 13px;
  }

  .form-input:focus {
    border-color: #111827;
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
    color: #6b7280;
    font-size: 12px;
    pointer-events: none;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 16px 24px;
    border-top: 1px solid #e5e7eb;
  }

  .cancel-btn {
    padding: 10px 18px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    background: #fff;
    color: #374151;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
  }

  .cancel-btn:hover {
    background: #f9fafb;
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
      align-items: flex-start;
    }

    .sorting-actions {
      flex-direction: column;
      align-items: flex-end;
      gap: 8px;
    }
  }
</style>
