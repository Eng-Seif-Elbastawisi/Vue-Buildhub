<script setup lang="ts">
  import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';

  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import Pagination from '@/shared/HelpersComponents/Pagination.vue';
  import { debounce } from '@/base/Presentation/Utils/debouced';
  import IndexAddIcon from '@/shared/icons/IndexAddIcon.vue';
  import DeleteDialog from '@/base/Presentation/Dialogs/MainDialogs/DeleteDialog.vue';
  import { useUserStore } from '@/stores/user';
  import ChangeStatusButton from '@/modules/MainOrganization/ChangeStatus/presentation/components/ChangeStatusButton.vue';
  import { StatusTypeEnum } from '@/modules/MainOrganization/ChangeStatus/core/constant/change_status.type.enum';
  import StageController from '@/modules/shared/Stages/presentation/controllers/stage.controller';
  import IndexStageParams from '@/modules/shared/Stages/core/params/index.stage.params';

  import type ProductsModel from '../../core/models/products.model';
  import type ProductStatsModel from '../../core/models/product.stats.model';

  import DeleteProductsParams from '../../core/params/delete.products.params';
  import IndexProductsParams from '../../core/params/index.products.params';

  import ProductsController from '../controllers/products.controller';

  interface StageItem {
    id: number;
    title: string;
  }

  interface StageApiItem extends StageItem {
    parent_id?: number | null;
  }

  interface StageGroup {
    id: number;
    title: string;
    stages: StageItem[];
  }

  const controller = ProductsController.getInstance();
  const stageController = StageController.getInstance();

  const state = computed(() => controller.listState.value);

  const route = useRoute();
  const router = useRouter();

  const perPage = ref(12);
  const word = ref('');
  const selectedStageIds = ref<number[]>([]);
  const stageGroups = ref<StageGroup[]>([]);
  const stagesLoading = ref(false);
  const isStageFilterOpen = ref(false);
  const stageFilterRef = ref<HTMLElement | null>(null);

  const { user } = useUserStore();

  // ======================================================
  // Stats
  // ======================================================

  const statsData = ref<ProductStatsModel | null>(null);

  const stats = computed(() => {
    return [
      {
        label: 'no_sorting',
        value: statsData.value?.hasNotSortingCount ?? 0,
        color: 'bg-slate-50',
      },
      {
        label: 'has_sorting',
        value: statsData.value?.hasSortingCount ?? 0,
        color: 'bg-emerald-50',
      },
      {
        label: 'all_products',
        value: statsData.value?.productsCount ?? 0,
        color: 'bg-amber-50',
      },
    ];
  });

  // ======================================================
  // Fetch Products
  // ======================================================

  const getRoutePage = () => {
    const page = Number(route.query.page);

    return Number.isInteger(page) && page > 0 ? page : 1;
  };

  const parseStageIds = (queryStages: unknown): number[] => {
    const rawStageIds = Array.isArray(queryStages)
      ? queryStages.join(',')
      : String(queryStages ?? '');

    return [
      ...new Set(
        rawStageIds
          .split(',')
          .map(Number)
          .filter((stageId) => Number.isInteger(stageId) && stageId > 0),
      ),
    ];
  };

  const fetchProducts = async (page: number = getRoutePage(), searchWord: string = word.value) =>
    controller.fetchList(
      new IndexProductsParams({
        word: searchWord,
        page,
        perPage: perPage.value,
        withPage: 1,
        stageIds: selectedStageIds.value,
      }),
    );

  const updateFilterQuery = (page: number) => {
    void router.push({
      query: {
        ...route.query,
        page: String(page),
        word: word.value || undefined,
        stages: selectedStageIds.value.length ? selectedStageIds.value.join(',') : undefined,
      },
    });
  };

  // ======================================================
  // Fetch Stats
  // ======================================================

  const fetchStats = async () => {
    const statsResponse = await controller.fetchStats(
      new IndexProductsParams({ page: 1, perPage: 1, withPage: 0 }),
    );

    statsData.value = statsResponse;
  };

  // ======================================================
  // Stage Filter
  // ======================================================

  const fetchSubStagesForMainStage = async (mainStage: StageApiItem) => {
    const subStageResponse = await stageController.fetchList(
      new IndexStageParams({
        word: '',
        page: 1,
        perPage: 100,
        withPage: 0,
        parentId: mainStage.id,
      }),
    );

    return ((subStageResponse.data ?? []) as StageItem[]).map((subStage) => ({
      ...subStage,
      parent_id: mainStage.id,
    }));
  };

  const fetchSubStages = async (mainStages: StageApiItem[]) =>
    (await Promise.all(mainStages.map(fetchSubStagesForMainStage))).flat();

  const createStageGroups = (mainStages: StageApiItem[], subStages: StageApiItem[]) =>
    mainStages.map((mainStage) => ({
      id: mainStage.id,
      title: mainStage.title,
      stages: subStages
        .filter((subStage) => subStage.parent_id === mainStage.id)
        .map((subStage) => ({ id: subStage.id, title: subStage.title })),
    }));

  const fetchStages = async () => {
    stagesLoading.value = true;

    try {
      const stageResponse = await stageController.fetchList(
        new IndexStageParams({
          word: '',
          page: 1,
          perPage: 1000,
          withPage: 0,
          parentId: null,
        }),
      );

      const allStages = (stageResponse.data ?? []) as StageApiItem[];
      const mainStages = allStages.filter((stage) => !stage.parent_id);
      let subStages = allStages.filter((stage) => stage.parent_id);

      if (mainStages.length && !subStages.length) {
        subStages = await fetchSubStages(mainStages);
      }

      stageGroups.value = createStageGroups(mainStages, subStages);
    } finally {
      stagesLoading.value = false;
    }
  };

  const toggleStage = (stageId: number) => {
    selectedStageIds.value = selectedStageIds.value.includes(stageId)
      ? selectedStageIds.value.filter((selectedId) => selectedId !== stageId)
      : [...selectedStageIds.value, stageId];
  };

  const isStageSelected = (stageId: number) => selectedStageIds.value.includes(stageId);

  const hasSubStages = (group: StageGroup) => group.stages.length > 0;

  const isStageGroupSelected = (group: StageGroup) =>
    hasSubStages(group) && group.stages.every((stage) => isStageSelected(stage.id));

  const toggleStageGroup = (group: StageGroup) => {
    if (!hasSubStages(group)) return;

    const subStageIds = group.stages.map((stage) => stage.id);

    selectedStageIds.value = isStageGroupSelected(group)
      ? selectedStageIds.value.filter((stageId) => !subStageIds.includes(stageId))
      : [...new Set([...selectedStageIds.value, ...subStageIds])];
  };

  const applyStageFilter = async () => {
    isStageFilterOpen.value = false;
    updateFilterQuery(1);
    await fetchProducts(1, word.value);
  };

  const clearStageFilter = async () => {
    selectedStageIds.value = [];
    isStageFilterOpen.value = false;
    updateFilterQuery(1);
    await fetchProducts(1, word.value);
  };

  const closeStageFilterOnOutsideClick = (event: PointerEvent) => {
    if (
      isStageFilterOpen.value &&
      event.target instanceof Node &&
      !stageFilterRef.value?.contains(event.target)
    ) {
      isStageFilterOpen.value = false;
    }
  };

  // ======================================================
  // Pagination
  // ======================================================

  const onPageChange = (page: number) => {
    void fetchProducts(page, word.value);
    updateFilterQuery(page);
  };

  // ======================================================
  // Search
  // ======================================================

  const Search = debounce(() => {
    updateFilterQuery(1);
    void fetchProducts(1, word.value);
  });

  // ======================================================
  // Per Page
  // ======================================================

  const onPerPageChange = (count: number) => {
    perPage.value = count;
    updateFilterQuery(1);
    void fetchProducts(1, word.value);
  };

  // ======================================================
  // Delete Product
  // ======================================================

  const deleteProduct = async (id: number) => {
    await controller.delete(
      new DeleteProductsParams({
        productsId: id,
      }),
    );

    await Promise.all([fetchProducts(), fetchStats()]);
  };

  const reloadProducts = async () => {
    await Promise.all([fetchProducts(), fetchStats()]);
  };

  // ======================================================
  // Helpers
  // ======================================================

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

  // ======================================================
  // Mounted
  // ======================================================

  onMounted(async () => {
    word.value = route.query.word ? String(route.query.word) : '';
    selectedStageIds.value = parseStageIds(route.query.stages);
    document.addEventListener('pointerdown', closeStageFilterOnOutsideClick);

    await Promise.all([fetchProducts(getRoutePage(), word.value), fetchStats(), fetchStages()]);
  });

  onBeforeUnmount(() => {
    document.removeEventListener('pointerdown', closeStageFilterOnOutsideClick);
  });
</script>

<template>
  <div class="products-library">
    <!-- Header -->
    <header class="page-header">
      <div class="header-left">
        <h1 class="title">
          {{ $t('Products.library_title') }}
        </h1>

        <p class="subtitle">
          {{ $t('Products.library_subtitle') }}

          <span class="badge">
            {{ $t('Products.badge') }}
          </span>
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
        <span class="stat-label">
          {{ $t(`Products.stats.${stat.label}`) }}
        </span>

        <span class="stat-value">
          {{ stat.value }}
        </span>
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

        <div ref="stageFilterRef" class="stage-filter">
          <button
            type="button"
            class="stage-filter-button"
            :class="{ active: selectedStageIds.length > 0 }"
            aria-haspopup="dialog"
            :aria-expanded="isStageFilterOpen"
            aria-controls="products-stage-filter"
            @click="isStageFilterOpen = !isStageFilterOpen"
          >
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
              <path d="M4 5h16" />
              <path d="M7 12h10" />
              <path d="M10 19h4" />
            </svg>

            <span>
              {{ $t('Products.filter_by_stage') }}

              <span v-if="selectedStageIds.length"> ({{ selectedStageIds.length }}) </span>
            </span>
          </button>

          <div
            v-if="isStageFilterOpen"
            id="products-stage-filter"
            class="stage-filter-popover"
            role="dialog"
            :aria-label="$t('Products.filter_by_stage')"
          >
            <div class="stage-filter-content">
              <div v-if="stagesLoading" class="stage-filter-state">
                {{ $t('Products.form.stages_loading') }}
              </div>

              <div v-else-if="!stageGroups.length" class="stage-filter-state">
                {{ $t('Products.form.stages_empty') }}
              </div>

              <div v-else class="stage-filter-groups">
                <section v-for="group in stageGroups" :key="group.id" class="stage-filter-group">
                  <button
                    type="button"
                    class="stage-filter-group-button"
                    :class="{ selected: isStageGroupSelected(group) }"
                    :disabled="!hasSubStages(group)"
                    :aria-pressed="hasSubStages(group) ? isStageGroupSelected(group) : undefined"
                    @click="toggleStageGroup(group)"
                  >
                    <span>{{ group.title }}</span>
                    <span class="stage-filter-count">{{ group.stages.length }}</span>
                  </button>

                  <div v-if="hasSubStages(group)" class="stage-filter-options">
                    <label
                      v-for="stage in group.stages"
                      :key="stage.id"
                      class="stage-filter-option"
                    >
                      <input
                        type="checkbox"
                        :checked="isStageSelected(stage.id)"
                        @change="toggleStage(stage.id)"
                      />

                      <span>{{ stage.title }}</span>
                    </label>
                  </div>
                </section>
              </div>
            </div>

            <div class="stage-filter-actions">
              <button
                type="button"
                class="stage-filter-apply"
                :disabled="stagesLoading"
                @click="applyStageFilter"
              >
                {{ $t('Products.apply_filter') }}
              </button>

              <button type="button" class="stage-filter-clear" @click="clearStageFilter">
                {{ $t('Products.clear_filter') }}
              </button>
            </div>
          </div>
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
                <h3 class="product-title">
                  {{ product.title }}
                </h3>

                <span class="price">
                  {{ formatPrice(product.expectedPrice) }}
                </span>
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
                  {{
                    $t(getStageLabel(product)!, {
                      count: getStageCount(product),
                    })
                  }}
                </span>

                <span v-if="product.measurementUnitTitle" class="tag tag-unit">
                  {{ product.measurementUnitTitle }}
                </span>
              </div>
            </div>

            <!-- Actions -->
            <div class="card-actions">
              <ChangeStatusButton
                :id="product.id!"
                :key="`${product.id}-${product.isActive}`"
                :initial-is-active="product.status"
                :type="StatusTypeEnum.PRODUCT"
                @reload="reloadProducts"
              />

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

                      <path d="M8 6V4c0-1 1-1 2-1h4c1 0 2 1 2 2v2" />
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

          <h3>
            {{ $t('Products.empty_title') }}
          </h3>

          <p>
            {{ $t('Products.empty_description') }}
          </p>

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

  .toolbar-right {
    display: flex;
    align-items: center;
    gap: var(--xs-size-3);
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

  .stage-filter {
    position: relative;
    flex-shrink: 0;
  }

  .stage-filter-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--xs-size-4);
    min-height: 40px;
    padding: var(--xs-size) var(--md-size);
    border: 1px solid var(--input-border-color);
    border-radius: var(--radius-sm);
    background: var(--bg-card);
    color: var(--title-card-color);
    font-size: var(--sm-size);
    font-weight: 600;
    white-space: nowrap;
    cursor: pointer;
    transition: var(--transition-fast);

    &:hover,
    &.active {
      border-color: var(--PrimaryColor);
      background: var(--PrimaryColor-light);
      color: var(--PrimaryColor);
    }

    &:focus-visible {
      outline: none;
      box-shadow: 0 0 0 3px var(--PrimaryColor-alpha-15);
    }
  }

  .stage-filter-popover {
    position: absolute;
    z-index: 20;
    inset-block-start: calc(100% + var(--xs-size-4));
    inset-inline-end: 0;
    width: min(360px, calc(100vw - 2rem));
    overflow: hidden;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-md);
    background: var(--bg-card);
    box-shadow: var(--shadow-md);
  }

  .stage-filter-content {
    max-height: 360px;
    overflow-y: auto;
    padding: var(--sm-size);
  }

  .stage-filter-state {
    padding: var(--md-size);
    color: var(--subtitle-color);
    font-size: var(--sm-size);
    text-align: center;
  }

  .stage-filter-groups {
    display: flex;
    flex-direction: column;
    gap: var(--sm-size);
  }

  .stage-filter-group {
    padding-bottom: var(--sm-size);
    border-bottom: 1px solid var(--border-weak);

    &:last-child {
      padding-bottom: 0;
      border-bottom: 0;
    }
  }

  .stage-filter-group-button {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--xs-size-4);
    width: 100%;
    padding: var(--xs-size-3) var(--xs-size);
    border: 0;
    border-radius: var(--radius-xs);
    background: transparent;
    color: var(--title-card-color);
    font-size: var(--sm-size);
    font-weight: 700;
    text-align: start;
    cursor: pointer;

    &:hover:not(:disabled),
    &.selected {
      background: var(--PrimaryColor-light);
      color: var(--PrimaryColor);
    }

    &:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }
  }

  .stage-filter-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 22px;
    height: 22px;
    padding-inline: var(--xs-size-5);
    border-radius: var(--radius-full);
    background: var(--gray-100);
    color: var(--gray-600);
    font-size: var(--xs-size-2);
  }

  .stage-filter-options {
    display: flex;
    flex-direction: column;
    gap: var(--xs-size-4);
    padding: var(--xs-size-4) var(--xs-size);
  }

  .stage-filter-option {
    display: flex;
    align-items: center;
    gap: var(--xs-size-3);
    color: var(--gray-700);
    font-size: var(--sm-size);
    cursor: pointer;

    input {
      width: 16px;
      height: 16px;
      margin: 0;
      accent-color: var(--PrimaryColor);
      cursor: pointer;
    }
  }

  .stage-filter-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--xs-size-3);
    padding: var(--sm-size);
    border-top: 1px solid var(--border-weak);
    background: var(--bg-section);

    button {
      padding: var(--xs-size) var(--sm-size);
      border-radius: var(--radius-xs);
      font-size: var(--sm-size);
      font-weight: 600;
      cursor: pointer;

      &:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }
    }
  }

  .stage-filter-apply {
    border: 1px solid var(--PrimaryColor);
    background: var(--PrimaryColor);
    color: var(--standard-white);
  }

  .stage-filter-clear {
    border: 1px solid var(--border-weak);
    background: var(--bg-card);
    color: var(--gray-700);
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

    .toolbar-right {
      width: 100%;
    }

    .search-box {
      width: auto;
      min-width: 0;
      flex: 1;
    }

    .stage-filter-popover {
      inset-inline-end: 0;
    }
  }
</style>
