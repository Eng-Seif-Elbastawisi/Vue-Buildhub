<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import Pagination from '@/shared/HelpersComponents/Pagination.vue';
  import type ProductsModel from '../../core/models/products.model';
  import DeleteProductsParams from '../../core/params/delete.products.params';
  import IndexProductsParams from '../../core/params/index.products.params';
  import ProductsController from '../controllers/products.controller';
  import { useUserStore } from '@/stores/user';
  import DeleteDialog from '@/base/Presentation/Dialogs/MainDialogs/DeleteDialog.vue';
  import { debounce } from '@/base/Presentation/Utils/debouced';
  import IndexAddIcon from '@/shared/icons/IndexAddIcon.vue';

  const controller = ProductsController.getInstance();
  const state = computed(() => controller.listState.value);
  const route = useRoute();
  const router = useRouter();
  const perPage = ref(12);
  const word = ref('');
  const { user } = useUserStore();

  const products = computed(() => (state.value.data as ProductsModel[]) ?? []);

  const stats = computed(() => {
    const list = products.value;
    const total = list.length;
    const withSorting = list.filter((p) => p.sortings?.length > 0).length;
    const multiLink = list.filter((p) => p.stageIds?.length > 1).length;
    const noSorting = total - withSorting;

    return [
      { label: 'no_sorting', value: noSorting, color: 'bg-slate-50' },
      { label: 'has_sorting', value: withSorting, color: 'bg-emerald-50' },
      { label: 'all_products', value: total, color: 'bg-amber-50' },
    ];
  });

  const fetchProducts = async (page: number = 1, searchWord: string = '') =>
    controller.fetchList(
      new IndexProductsParams(
        searchWord,
        route.query.page ? Number(route.query.page) : page,
        perPage.value,
        1,
      ),
    );

  const onPageChange = (page: number) => {
    void fetchProducts(page);
    void router.push({
      query: { ...route.query, page: String(page), word: word.value || undefined },
    });
  };

  const Search = debounce(() => {
    router.push({
      query: {
        ...route.query,
        page: 1,
        word: word.value || undefined,
      },
    });
    fetchProducts(1, word.value);
  });

  const onPerPageChange = (count: number) => {
    perPage.value = count;
    void fetchProducts(1);
  };

  const deleteProduct = async (id: number) => {
    await controller.delete(new DeleteProductsParams({ productsId: id }));
    await fetchProducts();
  };

  onMounted(async () => {
    word.value = route.query.word ? String(route.query.word) : '';
    await fetchProducts();
  });

  const formatPrice = (price?: number) => {
    if (price == null) return '—';
    return new Intl.NumberFormat('ar-EG').format(price);
  };

  const getStageLabel = (product: ProductsModel) => {
    const count = product.stageIds?.length ?? 0;
    if (count === 0) return null;
    if (count === 1) return 'Products.stages.one';
    return 'Products.stages.many';
  };

  const getStageCount = (product: ProductsModel) => product.stageIds?.length ?? 0;
</script>

<template>
  <div class="products-library">
    <!-- Header -->
    <header class="page-header">
      <div class="header-left">
        <h1 class="title">{{ $t('Products.library_title') }}</h1>
        <p class="subtitle">
          {{ $t('Products.library_subtitle') }}
          <span class="badge">{{ $t('Products.badge') }}</span>
        </p>
      </div>

      <router-link
        class="btn-add"
        :to="user?.type === 1 ? '/organization/products/add' : '/organization/products/add'"
      >
        <IndexAddIcon />
        {{ $t('Products.add') }}
      </router-link>
    </header>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div v-for="(stat, i) in stats" :key="i" class="stat-card" :class="stat.color">
        <span class="stat-label">{{ $t(`Products.stats.${stat.label}`) }}</span>
        <span class="stat-value">{{ stat.value }}</span>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="toolbar">
      <div class="toolbar-right">
        <div class="search-box">
          <svg
            class="search-icon"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            v-model="word"
            type="text"
            :placeholder="$t('Products.search_placeholder')"
            @input="Search"
          />
        </div>
      </div>
    </div>

    <!-- Content -->
    <DataStatusBuilder :controller="state" :on-retry="async () => await fetchProducts()">
      <!-- Success -->
      <template #success="{ data }">
        <div class="products-grid">
          <div v-for="product in data as ProductsModel[]" :key="product.id" class="product-card">
            <!-- Image -->
            <div class="card-image">
              <img v-if="product.image" :src="product.image" :alt="product.title" class="img" />
              <div v-else class="placeholder">
                <svg
                  width="32"
                  height="32"
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
              </div>
            </div>

            <!-- Body -->
            <div class="card-body">
              <div class="card-top">
                <h3 class="product-title">{{ product.title }}</h3>
                <span class="price">{{ formatPrice(product.expectedPrice) }}</span>
              </div>

              <div class="meta">
                <span v-if="product.itemTypeTitle" class="type-badge">
                  {{ product.itemTypeTitle }}
                </span>
              </div>

              <div class="tags">
                <span v-if="product.sortings?.length" class="tag tag-sorting">
                  {{ $t('Products.tags.sorting') }}
                </span>

                <span v-if="getStageLabel(product)" class="tag tag-stage">
                  {{ $t(getStageLabel(product)!, { count: getStageCount(product) }) }}
                </span>

                <span v-if="product.measurementUnitTitle" class="tag tag-unit">
                  {{ product.measurementUnitTitle }}
                </span>
              </div>
            </div>

            <!-- Actions -->
            <div class="card-actions">
              <!-- Edit -->
              <router-link
                class="action-btn edit"
                :to="`/organization/products/edit/${product.id}`"
                :title="$t('common.edit')"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </router-link>
              <!-- Show -->
              <router-link
                class="action-btn show"
                :to="`/organization/products/show/${product.id}`"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </router-link>

              <!-- Delete -->
              <DeleteDialog
                :title="$t('Products.delete_dialog.title')"
                :message="$t('Products.delete_dialog.message')"
                :hasbtn="true"
                @delete="deleteProduct(product.id!)"
              >
                <template #btn>
                  <button class="action-btn delete" type="button" :title="$t('common.delete')">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                  </button>
                </template>
              </DeleteDialog>
            </div>
          </div>
        </div>

        <Pagination
          :pagination="controller.pagination.value"
          @change-page="onPageChange"
          @count-per-page="onPerPageChange"
        />
      </template>

      <!-- Empty -->
      <template #empty>
        <div class="empty-state">
          <div class="empty-icon">📦</div>
          <h3>{{ $t('Products.empty_title') }}</h3>
          <p>{{ $t('Products.empty_description') }}</p>
          <router-link
            class="btn-add"
            :to="user?.type === 1 ? '/organization/products/add' : '/organization/products/add'"
          >
            <IndexAddIcon />
            {{ $t('Products.add') }}
          </router-link>
        </div>
      </template>

      <!-- Loader -->
      <template #loader>
        <div class="products-grid">
          <div v-for="i in 8" :key="i" class="product-card skeleton">
            <div class="card-image skeleton-box"></div>
            <div class="card-body">
              <div class="skeleton-line w-70"></div>
              <div class="skeleton-line w-40"></div>
              <div class="skeleton-line w-50"></div>
            </div>
          </div>
        </div>
      </template>
    </DataStatusBuilder>
  </div>
</template>

<style scoped lang="scss">
  .products-library {
    display: flex;
    flex-direction: column;
    gap: var(--md-size-2);
    padding: 0 var(--sm-size);
  }

  /* ========== Header ========== */
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;

    .title {
      font-size: var(--xl-size-2);
      font-weight: 700;
      color: var(--title-color);
      margin: 0;
    }

    .subtitle {
      color: var(--subtitle-color);
      margin-top: var(--xs-size-4);
      font-size: var(--sm-size);
    }

    .badge {
      background: var(--PrimaryColor-light);
      color: var(--PrimaryColor);
      padding: var(--xs-size-5) var(--xs-size-3);
      border-radius: var(--radius-full);
      font-size: var(--xs-size);
      font-weight: 500;
      margin-right: var(--xs-size-4);
    }
  }

  .btn-add {
    display: inline-flex;
    align-items: center;
    gap: var(--xs-size-4);
    background: var(--PrimaryColor);
    color: var(--standard-white);
    padding: var(--sm-size) var(--md-size);
    border-radius: var(--radius-sm);
    font-weight: 600;
    font-size: var(--sm-size);
    text-decoration: none;
    transition: var(--transition-fast);

    &:hover {
      background: var(--PrimaryColor-hover);
      box-shadow: var(--shadow-md);
    }
  }

  /* ========== Stats ========== */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--md-size);
  }

  .stat-card {
    background: var(--bg-card);
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-md);
    padding: var(--md-size);
    display: flex;
    flex-direction: column;
    gap: var(--xs-size-4);

    .stat-label {
      font-size: var(--sm-size);
      color: var(--subtitle-color);
    }

    .stat-value {
      font-size: var(--xl-size-2);
      font-weight: 700;
      color: var(--title-color);
    }
  }

  /* ========== Toolbar ========== */
  .toolbar {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: var(--md-size);
  }

  .search-box {
    position: relative;
    width: 280px;

    .search-icon {
      position: absolute;
      right: var(--xs-size);
      top: 50%;
      transform: translateY(-50%);
      color: var(--gray-400);
    }

    input {
      width: 100%;
      padding: var(--xs-size) calc(var(--md-size) + var(--sm-size)) var(--xs-size) var(--md-size);
      border: 1px solid var(--input-border-color);
      border-radius: var(--radius-sm);
      background: var(--bg-card);
      font-size: var(--sm-size);
      color: var(--Title-input-Color);

      &::placeholder {
        color: var(--placeholder-text);
      }

      &:focus {
        outline: none;
        border-color: var(--PrimaryColor);
        box-shadow: 0 0 0 3px var(--PrimaryColor-alpha-15);
      }
    }
  }

  /* ========== Grid ========== */
  .products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: var(--md-size);
  }

  .product-card {
    background: var(--bg-card);
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-lg);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: var(--transition);

    &:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }
  }

  .card-image {
    height: 140px;
    background: linear-gradient(135deg, var(--gray-50) 0%, var(--gray-100) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;

    .img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .placeholder {
      color: var(--gray-300);
    }
  }

  .card-body {
    padding: var(--md-size);
    flex: 1;
  }

  .card-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--xs-size-4);
    margin-bottom: var(--xs-size-4);

    .product-title {
      font-size: var(--sm-size);
      font-weight: 600;
      color: var(--title-card-color);
      margin: 0;
      line-height: 1.35;
    }

    .price {
      font-size: var(--sm-size);
      font-weight: 700;
      color: var(--PrimaryColor);
      white-space: nowrap;
    }
  }

  .meta {
    margin-bottom: var(--xs-size-3);

    .type-badge {
      font-size: var(--xs-size);
      color: var(--subtitle-color);
    }
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--xs-size-4);
  }

  .tag {
    font-size: var(--xs-size-2);
    padding: var(--xs-size-5) var(--xs-size-3);
    border-radius: var(--radius-full);
    font-weight: 500;
  }

  .tag-sorting {
    background: var(--PrimaryColor-light);
    color: var(--PrimaryColor);
  }

  .tag-stage {
    background: var(--info-light);
    color: var(--info-dark);
  }

  .tag-unit {
    background: var(--gray-100);
    color: var(--gray-600);
  }

  /* ========== Actions ========== */
  .card-actions {
    display: flex;
    gap: var(--xs-size-4);
    padding: var(--xs-size-3) var(--md-size) var(--md-size);
    border-top: 1px solid var(--gray-100);
    background: var(--bg-section);
  }

  .action-btn {
    flex: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 36px;
    border-radius: var(--radius-xs);
    border: none;
    cursor: pointer;
    font-size: var(--xs-size);
    font-weight: 600;
    transition: var(--transition-fast);
    text-decoration: none;

    svg {
      flex-shrink: 0;
    }

    &.show {
      background: var(--info-light);
      color: var(--info-dark);

      &:hover {
        background: var(--info);
        color: var(--standard-white);
        box-shadow: var(--shadow-md);
      }
    }

    &.edit {
      background: var(--PrimaryColor);
      color: var(--standard-white);

      &:hover {
        background: var(--PrimaryColor-hover);
        box-shadow: var(--shadow-md);
      }
    }

    &.delete {
      background: var(--gray-100);
      color: var(--gray-500);
      border: 1px solid var(--border-weak);

      &:hover {
        background: var(--danger);
        color: var(--standard-white);
        border-color: var(--danger);
        box-shadow: var(--shadow-md);
      }
    }
  }

  /* ========== Empty ========== */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--xs-size-3);
    padding: var(--section-padding) var(--md-size);
    text-align: center;

    .empty-icon {
      font-size: var(--xl-size-2);
    }

    h3 {
      margin: 0;
      color: var(--title-color);
    }

    p {
      color: var(--subtitle-color);
      margin: 0;
    }
  }

  /* ========== Skeleton ========== */
  .skeleton {
    pointer-events: none;

    .skeleton-box,
    .skeleton-line {
      background: linear-gradient(
        90deg,
        var(--gray-100) 25%,
        var(--gray-200) 50%,
        var(--gray-100) 75%
      );
      background-size: 200% 100%;
      animation: shimmer 1.4s infinite;
    }

    .skeleton-line {
      height: 12px;
      border-radius: var(--radius-xs);
      margin-bottom: var(--xs-size-4);

      &.w-70 {
        width: 70%;
      }
      &.w-40 {
        width: 40%;
      }
      &.w-50 {
        width: 50%;
      }
    }
  }

  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }

  /* ========== Responsive ========== */
  @media (max-width: 900px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 640px) {
    .page-header {
      flex-direction: column;
      gap: var(--md-size);
    }

    .stats-grid {
      grid-template-columns: 1fr 1fr;
    }

    .toolbar {
      flex-direction: column;
      align-items: stretch;
    }

    .search-box {
      width: 100%;
    }
  }
</style>
