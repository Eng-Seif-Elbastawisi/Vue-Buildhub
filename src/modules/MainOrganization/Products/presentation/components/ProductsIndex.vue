<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';

  import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import { dialogManager } from '@/base/Presentation/Dialogs/dialog.manager';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import Pagination from '@/shared/HelpersComponents/Pagination.vue';
  import AppTable, { type TableHeader } from '@/shared/HelpersComponents/AppTable.vue';
  import IndexPageHeader from '@/shared/IndexPageHeader/IndexPageHeader.vue';
  import { debounce } from '@/base/Presentation/Utils/debouced';
  import IndexAddIcon from '@/shared/icons/IndexAddIcon.vue';
  import ConfirmCancelDialog from '@/base/Presentation/Dialogs/ConfirmCancelDialog.vue';
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

  const tableHeaders: TableHeader[] = [
    { key: 'summary', label: 'Products.form.product_name' },
    { key: 'meta', label: 'Products.form.product_data' },
    { key: 'price', label: 'price' },
    { key: 'status', label: 'Products.form.status' },
  ];

  const route = useRoute();
  const router = useRouter();
  const { t } = useI18n();

  const perPage = ref(12);
  const word = ref('');
  const selectedStageIds = ref<number[]>([]);
  const stageGroups = ref<StageGroup[]>([]);
  const stagesLoading = ref(false);
  const isStageFilterOpen = ref(false);
  const stageFilterRef = ref<HTMLElement | null>(null);

  const statsData = ref<ProductStatsModel | null>(null);

  const stats = computed(() => {
    return [
      {
        label: 'all_products',
        value: statsData.value?.productsCount ?? 0,
        tone: 'primary',
      },
      {
        label: 'has_sorting',
        value: statsData.value?.hasSortingCount ?? 0,
        tone: 'success',
      },
      {
        label: 'no_sorting',
        value: statsData.value?.hasNotSortingCount ?? 0,
        tone: 'neutral',
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

  const retryProducts = async (): Promise<void> => {
    await fetchProducts();
  };

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

  const onPageChange = (page: number) => {
    void fetchProducts(page, word.value);
    updateFilterQuery(page);
  };

  // ======================================================
  // Search
  // ======================================================

  const search = debounce(() => {
    updateFilterQuery(1);
    void fetchProducts(1, word.value);
  });

  const onPerPageChange = (count: number) => {
    perPage.value = count;
    updateFilterQuery(1);
    void fetchProducts(1, word.value);
  };

  const deleteProduct = async (id: number) => {
    const deletionState = await controller.delete(
      new DeleteProductsParams({
        productsId: id,
      }),
    );

    if (!(deletionState instanceof DataSuccess)) return;

    dialogManager.toastSuccess(deletionState.message || t('Products.delete_success'));
    await Promise.all([fetchProducts(), fetchStats()]);
  };

  const reloadProducts = async () => {
    await Promise.all([fetchProducts(), fetchStats()]);
  };

  const formatPrice = (price?: number) => {
    if (price == null) return '—';

    return new Intl.NumberFormat('ar-EG').format(price);
  };

  const getStageCount = (product: ProductsModel) => product.stageIds?.length ?? 0;

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
    <IndexPageHeader :title="$t('Products.page_title')" :subtitle="$t('Products.page_subtitle')">
      <template #eyebrow>
        <nav class="breadcrumb" :aria-label="$t('Products.breadcrumb_label')">
          <router-link to="/">{{ $t('home') }}</router-link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{{ $t('Products.page_title') }}</span>
        </nav>
      </template>

      <template #decoration>
        <svg
          class="header-watermark"
          width="150"
          height="110"
          viewBox="0 0 150 110"
          fill="none"
          aria-hidden="true"
        >
          <path d="M18 101V39l37-18v80M55 101V9l47 18v74M102 101V48l30 13v40" />
          <path
            d="M31 48h11M31 61h11M31 74h11M68 32h12M68 47h12M68 62h12M68 77h12M113 65h8M113 78h8"
          />
        </svg>
      </template>

      <template #search>
        <div class="search-box">
          <label class="sr-only" for="product-search">
            {{ $t('Products.search_placeholder') }}
          </label>

          <svg
            class="search-icon"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>

          <input
            id="product-search"
            v-model="word"
            type="search"
            :placeholder="$t('Products.search_placeholder')"
            @input="search"
          />
        </div>
      </template>

      <template #actions>
        <router-link class="btn-add" to="/organization/products/add">
          <IndexAddIcon />
          {{ $t('Products.add') }}
        </router-link>
      </template>

      <template #filters>
        <div class="toolbar-actions">
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
              <span class="filter-button-icon" aria-hidden="true">
                <svg
                  width="17"
                  height="17"
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
              </span>

              <span>{{ $t('Products.filter_by_stage') }}</span>

              <span v-if="selectedStageIds.length" class="active-filter-count">
                {{ selectedStageIds.length }}
              </span>

              <svg
                class="filter-chevron"
                :class="{ open: isStageFilterOpen }"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            <div
              v-if="isStageFilterOpen"
              id="products-stage-filter"
              class="stage-filter-popover"
              role="dialog"
              :aria-label="$t('Products.filter_by_stage')"
            >
              <header class="filter-popover-header">
                <span class="filter-panel-icon" aria-hidden="true">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M4 5h16M7 12h10M10 19h4" />
                  </svg>
                </span>

                <div>
                  <strong>{{ $t('Products.filter_by_stage') }}</strong>
                  <span v-if="selectedStageIds.length">
                    {{ selectedStageIds.length }} {{ $t('Products.form.selected') }}
                  </span>
                </div>
              </header>

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
      </template>
    </IndexPageHeader>

    <div class="stats-grid">
      <article
        v-for="stat in stats"
        :key="stat.label"
        class="stat-card"
        :class="`stat-card--${stat.tone}`"
      >
        <div class="stat-icon" aria-hidden="true">
          <svg
            v-if="stat.label === 'no_sorting'"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="m8 8 8 8" />
          </svg>

          <svg
            v-else-if="stat.label === 'has_sorting'"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="m12 2 9 5-9 5-9-5 9-5Z" />
            <path d="m3 12 9 5 9-5" />
            <path d="m3 17 9 5 9-5" />
          </svg>

          <svg
            v-else
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        </div>

        <div class="stat-copy">
          <strong class="stat-value" aria-live="polite">{{ stat.value }}</strong>
          <span class="stat-label">{{ $t(`Products.stats.${stat.label}`) }}</span>
        </div>
      </article>
    </div>

    <DataStatusBuilder :controller="state" :on-retry="retryProducts">
      <template #success="{ data }">
        <AppTable
          :headers="tableHeaders"
          :items="data as ProductsModel[]"
          row-key="id"
          min-width="1100px"
          table-label="Products.page_title"
          actions-label="Products.show.actions"
          hoverable
        >
          <template #cell-summary="{ item: product }">
            <div class="product-cell product-summary">
              <div class="product-thumbnail">
                <img
                  v-if="product.image"
                  :src="product.image"
                  :alt="product.title"
                  loading="lazy"
                />

                <svg
                  v-else
                  width="25"
                  height="25"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  aria-hidden="true"
                >
                  <path
                    d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
                  />
                  <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
                </svg>
              </div>

              <div class="product-primary-copy">
                <router-link
                  class="product-title"
                  :to="`/organization/products/show/${product.id}`"
                >
                  {{ product.title || '—' }}
                </router-link>
                <span v-if="product.code" class="product-code">#{{ product.code }}</span>
              </div>
            </div>
          </template>

          <template #cell-meta="{ item: product }">
            <div class="product-cell product-meta">
              <span class="tag tag-category">
                {{ product.itemTypeTitle || $t('Products.show.uncategorized') }}
              </span>

              <span v-if="getStageCount(product)" class="tag tag-stage">
                {{ $t('Products.tags.stage', { count: getStageCount(product) }) }}
              </span>

              <span v-if="product.measurementUnitTitle" class="tag tag-unit">
                {{ product.measurementUnitTitle }}
              </span>

              <span v-if="product.sortings?.length" class="tag tag-sorting">
                {{ $t('Products.tags.sorting') }}
              </span>
            </div>
          </template>

          <template #cell-price="{ item: product }">
            <div class="product-cell product-price">
              <strong>{{ formatPrice(product.expectedPrice) }}</strong>
              <span>{{ $t('Products.form.currency') }}</span>
            </div>
          </template>

          <template #cell-status="{ item: product }">
            <div class="product-cell product-status">
              <span class="status-badge" :class="product.status ? 'is-active' : 'is-inactive'">
                <span class="status-dot" aria-hidden="true"></span>
                {{ product.status ? $t('Products.form.active') : $t('Products.form.inactive') }}
              </span>
            </div>
          </template>

          <template #actions="{ item: product }">
            <div class="product-cell product-actions row-actions">
              <router-link
                class="action-btn show"
                :to="`/organization/products/show/${product.id}`"
                :title="$t('show')"
                :aria-label="$t('show')"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  aria-hidden="true"
                >
                  <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
                  <circle cx="12" cy="12" r="2.5" />
                </svg>
              </router-link>

              <router-link
                class="action-btn edit table-action-primary"
                :to="`/organization/products/edit/${product.id}`"
                :title="$t('common.edit')"
                :aria-label="$t('common.edit')"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  aria-hidden="true"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" />
                </svg>
              </router-link>

              <div class="status-action">
                <span class="sr-only">{{ $t('Products.form.status') }}</span>
                <ChangeStatusButton
                  :id="product.id!"
                  :key="`${product.id}-${product.isActive}`"
                  :initial-is-active="product.status"
                  :type="StatusTypeEnum.PRODUCT"
                  @reload="reloadProducts"
                />
              </div>
              <!--
                <ConfirmCancelDialog
                  :title="$t('Products.delete_dialog.title')"
                  :message="$t('Products.delete_dialog.message')"
                  :confirm-label="$t('confirm')"
                  :cancel-label="$t('cancel')"
                  confirm-theme="danger"
                  @confirm="deleteProduct(product.id!)"
                >
                  <template #trigger="{ open }">
                    <button
                      class="action-btn delete"
                      type="button"
                      :title="$t('common.delete')"
                      :aria-label="$t('common.delete')"
                      @click="open"
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        aria-hidden="true"
                      >
                        <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v5M14 11v5" />
                      </svg>
                    </button>
                  </template>
                </ConfirmCancelDialog> -->
            </div>
          </template>
        </AppTable>

        <Pagination
          :pagination="controller.pagination.value"
          @change-page="onPageChange"
          @count-per-page="onPerPageChange"
        />
      </template>

      <template #empty>
        <div class="empty-state">
          <svg
            class="empty-icon"
            width="34"
            height="34"
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
            {{ $t('Products.empty_title') }}
          </h3>

          <p>
            {{ $t('Products.empty_description') }}
          </p>

          <router-link class="btn-add" to="/organization/products/add">
            <IndexAddIcon />

            {{ $t('Products.add') }}
          </router-link>
        </div>
      </template>

      <template #loader>
        <div class="product-list-skeleton" aria-hidden="true">
          <div v-for="i in 6" :key="i" class="skeleton-row">
            <div class="skeleton-product">
              <span class="skeleton-thumbnail skeleton-box"></span>
              <span class="skeleton-copy">
                <span class="skeleton-line skeleton-line--title"></span>
                <span class="skeleton-line skeleton-line--code"></span>
              </span>
            </div>

            <span class="skeleton-line skeleton-line--meta"></span>
            <span class="skeleton-line skeleton-line--price"></span>
            <span class="skeleton-line skeleton-line--status"></span>
            <span class="skeleton-line skeleton-line--actions"></span>
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
    gap: 1.25rem;
    padding: clamp(1rem, 2vw, 1.75rem);
    background: var(--bg-section);
    border-radius: var(--radius-xl);
  }

  .page-header {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1.5rem;
    min-height: 8.5rem;
    overflow: hidden;
    padding: 1.35rem 1.5rem;
    background: var(--bg-card);
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);

    .title {
      margin: 0.45rem 0 0;
      color: var(--title-color);
      font-size: clamp(1.45rem, 2vw, 1.9rem);
      font-weight: 800;
      line-height: 1.25;
    }

    .subtitle {
      margin: 0.35rem 0 0;
      color: var(--subtitle-color);
      font-size: var(--sm-size);
    }
  }

  .header-copy {
    position: relative;
    z-index: 1;
    min-width: 0;
  }

  .breadcrumb {
    display: flex;
    align-items: center;
    gap: 0.45rem;
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

  .header-watermark {
    position: absolute;
    inset-block-end: -0.8rem;
    inset-inline-end: 11rem;
    color: var(--PrimaryColor);
    opacity: 0.09;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 2;
    pointer-events: none;
  }

  .btn-add {
    position: relative;
    z-index: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--xs-size-4);
    min-height: 2.75rem;
    padding: var(--sm-size) var(--md-size);
    color: var(--standard-white);
    background: var(--PrimaryColor);
    border-radius: var(--radius-sm);
    font-size: var(--sm-size);
    font-weight: 700;
    text-decoration: none;
    transition: var(--transition-fast);

    &:hover {
      background: var(--PrimaryColor-hover);
      box-shadow: var(--shadow-md);
      transform: translateY(-1px);
    }

    &:focus-visible {
      outline: 2px solid var(--PrimaryColor);
      outline-offset: 3px;
    }
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: 0.9rem;
    min-width: 0;
    padding: 0.9rem 1rem;
    background: var(--bg-card);
    border: 1px solid var(--border-weak);
    border-inline-start: 0.2rem solid var(--gray-400);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);

    &--success {
      border-inline-start-color: var(--success);

      .stat-icon {
        color: var(--success-dark);
        background: var(--success-light);
      }
    }

    &--primary {
      border-inline-start-color: var(--PrimaryColor);

      .stat-icon {
        color: var(--PrimaryColor);
        background: var(--PrimaryColor-alpha-8);
      }
    }

    .stat-label {
      color: var(--subtitle-color);
      font-size: var(--sm-size);
    }

    .stat-value {
      color: var(--title-color);
      font-size: var(--xl-size-2);
      font-weight: 700;
      line-height: 1;
    }
  }

  .stat-icon {
    display: grid;
    flex: 0 0 2.75rem;
    width: 2.75rem;
    height: 2.75rem;
    color: var(--gray-600);
    background: var(--gray-100);
    border-radius: var(--radius-md);
    place-items: center;
  }

  .stat-copy {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    min-width: 0;
  }

  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.8rem;
    background: var(--bg-card);
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
  }

  .toolbar-actions {
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  .search-box {
    position: relative;
    width: min(100%, 34rem);
    flex: 1;

    .search-icon {
      position: absolute;
      top: 50%;
      inset-inline-start: 0.9rem;
      color: var(--gray-400);
      pointer-events: none;
      transform: translateY(-50%);
    }

    input {
      width: 100%;
      min-height: 2.65rem;
      padding-block: 0.65rem;
      padding-inline: 2.75rem 1rem;
      color: var(--Title-input-Color);
      background: var(--gray-50);
      border: 1px solid var(--input-border-color);
      border-radius: var(--radius-sm);
      font-size: var(--sm-size);
      transition:
        border-color var(--transition-fast),
        box-shadow var(--transition-fast);

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

  .sr-only {
    position: absolute;
    overflow: hidden;
    width: 1px;
    height: 1px;
    padding: 0;
    border: 0;
    clip: rect(0, 0, 0, 0);
    margin: -1px;
    white-space: nowrap;
  }

  .stage-filter {
    position: relative;
    flex-shrink: 0;
  }

  .stage-filter-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-height: 2.65rem;
    padding: 0.45rem 0.75rem;
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

  .filter-button-icon,
  .filter-panel-icon {
    display: grid !important;
    color: var(--PrimaryColor);
    background: var(--PrimaryColor-light);
    border-radius: var(--radius-xs);
    place-items: center;
  }

  .filter-button-icon {
    width: 1.8rem;
    height: 1.8rem;
  }

  .active-filter-count {
    display: grid;
    min-width: 1.35rem;
    height: 1.35rem;
    padding-inline: 0.3rem;
    color: var(--standard-white);
    background: var(--PrimaryColor);
    border-radius: var(--radius-full);
    font-size: var(--xs-size-2);
    place-items: center;
  }

  .filter-chevron {
    color: var(--gray-400);
    transition: transform var(--transition-fast);

    &.open {
      transform: rotate(180deg);
    }
  }

  .stage-filter-popover {
    position: absolute;
    z-index: 20;
    inset-block-start: calc(100% + 0.55rem);
    inset-inline-end: 0;
    width: min(28rem, calc(100vw - 2rem));
    overflow: hidden;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-lg);
    background: var(--bg-card);
    box-shadow: var(--shadow-lg);
  }

  .filter-popover-header {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    padding: 0.85rem 1rem;
    background: var(--gray-50);
    border-bottom: 1px solid var(--border-weak);

    strong,
    span {
      display: block;
    }

    strong {
      color: var(--title-card-color);
      font-size: var(--sm-size);
      font-weight: 800;
    }

    div > span {
      margin-top: 0.1rem;
      color: var(--subtitle-color);
      font-size: var(--xs-size-2);
    }
  }

  .filter-panel-icon {
    flex: 0 0 2.1rem;
    width: 2.1rem;
    height: 2.1rem;
  }

  .stage-filter-content {
    max-height: 22rem;
    overflow-y: auto;
    padding: 0.85rem;
  }

  .stage-filter-state {
    padding: var(--md-size);
    color: var(--subtitle-color);
    font-size: var(--sm-size);
    text-align: center;
  }

  .stage-filter-groups {
    display: grid;
    gap: 0.65rem;
  }

  .stage-filter-group {
    overflow: hidden;
    background: var(--bg-card);
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-sm);
  }

  .stage-filter-group-button {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--xs-size-4);
    width: 100%;
    min-height: 2.5rem;
    padding: 0.55rem 0.7rem;
    border: 0;
    border-radius: 0;
    background: var(--gray-50);
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
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.35rem;
    padding: 0.55rem;
  }

  .stage-filter-option {
    display: flex;
    align-items: center;
    gap: var(--xs-size-3);
    min-width: 0;
    padding: 0.45rem 0.5rem;
    color: var(--gray-700);
    background: var(--bg-card);
    border: 1px solid transparent;
    border-radius: var(--radius-xs);
    font-size: var(--sm-size);
    cursor: pointer;

    &:hover {
      color: var(--PrimaryColor);
      background: var(--PrimaryColor-light);
      border-color: var(--PrimaryColor-alpha-30);
    }

    input {
      flex: 0 0 1rem;
      width: 1rem;
      height: 1rem;
      margin: 0;
      accent-color: var(--PrimaryColor);
      cursor: pointer;
    }
  }

  .stage-filter-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
    padding: 0.75rem 0.85rem;
    border-top: 1px solid var(--border-weak);
    background: var(--bg-section);

    button {
      min-height: 2.35rem;
      padding: 0.5rem 0.75rem;
      border-radius: var(--radius-sm);
      font-size: var(--sm-size);
      font-weight: 600;
      cursor: pointer;
      transition: var(--transition-fast);

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

    &:hover:not(:disabled) {
      background: var(--PrimaryColor-hover);
      border-color: var(--PrimaryColor-hover);
    }
  }

  .stage-filter-clear {
    border: 1px solid var(--border-weak);
    background: var(--bg-card);
    color: var(--gray-700);

    &:hover {
      background: var(--gray-100);
      border-color: var(--border-strong);
    }
  }

  .product-list-skeleton {
    overflow: hidden;
    background: var(--bg-card);
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
  }

  .skeleton-row {
    display: grid;
    grid-template-columns:
      minmax(16rem, 1.35fr)
      minmax(16rem, 1.2fr)
      minmax(7.5rem, 0.55fr)
      minmax(7.5rem, 0.55fr)
      minmax(15rem, 1fr);
    align-items: center;
    gap: 1rem;
  }

  .product-cell {
    min-width: 0;
  }

  .product-summary {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .product-thumbnail {
    display: grid;
    overflow: hidden;
    flex: 0 0 25px;
    width: 25px;
    height: 25px;
    color: var(--gray-300);
    background: var(--gray-100);
    border: 1px solid var(--border-weak);
    border-radius: 7px;
    place-items: center;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .product-primary-copy {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 2px;
  }

  .product-title {
    overflow: hidden;
    color: var(--index-table-ink);
    font-size: var(--sm-size);
    font-weight: 700;
    line-height: 1.4;
    text-decoration: none;
    text-overflow: ellipsis;
    white-space: nowrap;

    &:hover {
      color: var(--index-table-accent);
    }

    &:focus-visible {
      outline: 2px solid var(--index-table-accent);
      outline-offset: 2px;
    }
  }

  .product-code {
    color: var(--index-table-muted);
    font-size: 0.68rem;
    font-weight: 700;
    direction: ltr;
    text-align: start;
  }

  .product-meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.35rem;
  }

  .tag {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .tag-category,
  .tag-stage {
    color: var(--index-table-neutral-ink);
    background: var(--index-table-neutral-soft);
  }

  .tag-sorting {
    color: var(--index-table-accent-dark);
    background: var(--index-table-accent-soft);
  }

  .tag-unit {
    color: var(--index-table-neutral-ink);
    background: var(--index-table-neutral-soft);
  }

  .product-price {
    display: flex;
    align-items: baseline;
    gap: 0.25rem;
    white-space: nowrap;

    strong {
      color: var(--index-table-ink);
      font-size: var(--sm-size);
      font-weight: 700;
    }

    span {
      color: var(--index-table-muted);
      font-size: 0.68rem;
      font-weight: 600;
    }
  }

  .product-status {
    display: flex;
    align-items: center;
  }

  .status-badge {
    &.is-active {
      color: var(--success-dark);
      background: var(--success-light);
    }

    &.is-inactive {
      color: var(--danger-dark);
      background: var(--danger-light);
    }
  }

  .status-dot {
    width: 0.4rem;
    height: 0.4rem;
    background: currentColor;
    border-radius: var(--radius-full);
  }

  .status-action {
    display: grid;
    width: 44px;
    min-height: 27px;
    background: var(--index-table-paper);
    border: 1px solid var(--index-table-line);
    border-radius: var(--radius-sm);
    place-items: center;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--xs-size-3);
    padding: var(--section-padding) var(--md-size);
    background: var(--bg-card);
    border: 1px dashed var(--border-strong);
    border-radius: var(--radius-xl);
    text-align: center;

    .empty-icon {
      box-sizing: content-box;
      padding: 0.75rem;
      color: var(--PrimaryColor);
      background: var(--PrimaryColor-light);
      border-radius: var(--radius-md);
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

  .product-list-skeleton {
    pointer-events: none;
  }

  .skeleton-row {
    min-height: 5.5rem;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--border-weak);

    &:last-child {
      border-bottom: 0;
    }
  }

  .skeleton-product,
  .skeleton-copy {
    display: flex;
  }

  .skeleton-product {
    align-items: center;
    gap: 0.75rem;
  }

  .skeleton-copy {
    width: min(10rem, 60%);
    flex-direction: column;
    gap: 0.45rem;
  }

  .skeleton-box,
  .skeleton-line {
    display: block;
    background: linear-gradient(
      90deg,
      var(--gray-100) 25%,
      var(--gray-200) 50%,
      var(--gray-100) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
  }

  .skeleton-thumbnail {
    flex: 0 0 3.75rem;
    width: 3.75rem;
    height: 3.75rem;
    border-radius: var(--radius-sm);
  }

  .skeleton-line {
    width: 75%;
    height: 0.75rem;
    border-radius: var(--radius-xs);

    &--title {
      width: 100%;
    }

    &--code {
      width: 45%;
      height: 0.6rem;
    }

    &--meta {
      width: 70%;
    }

    &--price,
    &--status {
      width: 65%;
    }

    &--actions {
      width: 90%;
      height: 2.2rem;
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

  @media (max-width: 1120px) {
    .product-table-head {
      display: none;
    }

    .product-table-body {
      gap: 0.75rem;
      padding: 0.75rem;
      background: var(--gray-50);
    }

    .product-row,
    .skeleton-row {
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 0.7rem 1.5rem;
      min-height: 0;
      padding: 0.9rem;
      background: var(--bg-card);
      border: 1px solid var(--border-weak);
      border-radius: var(--radius-sm);
    }

    .product-summary,
    .product-meta,
    .product-actions,
    .skeleton-product,
    .skeleton-line--meta,
    .skeleton-line--actions {
      grid-column: 1 / -1;
    }

    .product-price,
    .product-status,
    .product-actions {
      &::before {
        content: attr(data-label);
        color: var(--gray-500);
        font-size: var(--xs-size-2);
        font-weight: 600;
      }
    }

    .product-price,
    .product-status {
      justify-content: space-between;
      gap: 0.75rem;
    }

    .product-actions {
      justify-content: flex-start;
      padding-top: 0.7rem;
      border-top: 1px solid var(--border-weak);

      &::before {
        margin-inline-end: auto;
      }
    }
  }

  @media (max-width: 900px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .header-watermark {
      inset-inline-end: 8rem;
    }
  }

  @media (max-width: 640px) {
    .products-library {
      padding: 0.75rem;
    }

    .page-header {
      flex-direction: column;
      align-items: stretch;
      gap: var(--md-size);
      padding: 1rem;
    }

    .header-watermark {
      display: none;
    }

    .btn-add {
      width: 100%;
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }

    .toolbar {
      flex-direction: column;
      align-items: stretch;
    }

    .toolbar-actions,
    .stage-filter,
    .stage-filter-button {
      width: 100%;
    }

    .search-box {
      width: auto;
      min-width: 0;
      flex: 1;
    }

    .stage-filter-popover {
      inset-inline-end: 0;
      width: 100%;
    }
  }

  @media (max-width: 520px) {
    .stage-filter-options,
    .skeleton-row {
      grid-template-columns: 1fr;
    }

    .skeleton-product,
    .skeleton-line--meta,
    .skeleton-line--price,
    .skeleton-line--status,
    .skeleton-line--actions {
      grid-column: 1;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .action-btn,
    .filter-chevron,
    .btn-add {
      transition: none;
    }

    .skeleton-box,
    .skeleton-line {
      animation: none;
    }
  }
</style>
