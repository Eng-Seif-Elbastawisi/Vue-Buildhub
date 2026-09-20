<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useRoute, useRouter } from 'vue-router';
  import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import { dialogManager } from '@/base/Presentation/Dialogs/dialog.manager';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import ChangeStatusButton from '@/modules/MainOrganization/ChangeStatus/presentation/components/ChangeStatusButton.vue';
  import { StatusTypeEnum } from '@/modules/MainOrganization/ChangeStatus/core/constant/change_status.type.enum';
  import DeleteDialog from '@/base/Presentation/Dialogs/MainDialogs/DeleteDialog.vue';
  import AppTable, { type TableHeader } from '@/shared/HelpersComponents/AppTable.vue';
  import { deleteSelectedRows } from '@/shared/HelpersComponents/deleteSelectedRows';
  import Pagination from '@/shared/HelpersComponents/Pagination.vue';
  import TableSkelaton from '@/shared/HelpersComponents/TableSkelaton.vue';
  import type LaborModel from '../../core/models/labor.model';
  import type { LaborPricingMode } from '../../core/models/labor.model';
  import DeleteLaborParams from '../../core/params/delete.labor.params';
  import IndexLaborParams from '../../core/params/index.labor.params';
  import LaborController from '../controllers/labor.controller';
  import { useUserStore } from '@/stores/user';
  import IndexAddIcon from '@/shared/icons/IndexAddIcon.vue';
  import { debounce } from '@/base/Presentation/Utils/debouced';
  import { UnitTypeEnum } from '@/modules/shared/Materials/core/constant/unit.type.enum';
  import ItemTypesController from '@/modules/MainOrganization/ItemTypes/presentation/controllers/item.types.controller';
  import IndexItemTypesParams from '@/modules/MainOrganization/ItemTypes/core/params/index.item.types.params';
  import MeasurementController from '@/modules/shared/measurement/presentation/controllers/measurement.controller';
  import IndexMeasurementParams from '@/modules/shared/measurement/core/params/index.measurement.params';

  const controller = LaborController.getInstance();
  const itemTypesController = ItemTypesController.getInstance();
  const measurementController = MeasurementController.getInstance();
  const state = computed(() => controller.listState.value);
  const router = useRouter();
  const route = useRoute();
  const { t, locale } = useI18n();
  const perPage = ref(10);
  const word = ref('');

  type LaborFilterCategory =
    'itemTypes' | 'measurementUnits' | 'statuses' | 'pricingModes' | 'mappingReadiness';

  interface LaborFilterSelections {
    itemTypes: string[];
    measurementUnits: string[];
    statuses: string[];
    pricingModes: string[];
    mappingReadiness: string[];
  }

  interface LaborFilterOption {
    id: string;
    title: string;
  }

  interface LaborFilterGroup {
    key: LaborFilterCategory;
    label: string;
    options: LaborFilterOption[];
  }

  const itemTypeFilterOptions = ref<LaborFilterOption[]>([]);
  const measurementFilterOptions = ref<LaborFilterOption[]>([]);
  const filtersLoading = ref(false);
  const isFilterDialogOpen = ref(false);

  const createEmptyFilters = (): LaborFilterSelections => ({
    itemTypes: [],
    measurementUnits: [],
    statuses: [],
    pricingModes: [],
    mappingReadiness: [],
  });

  const cloneFilters = (filters: LaborFilterSelections): LaborFilterSelections => ({
    itemTypes: [...filters.itemTypes],
    measurementUnits: [...filters.measurementUnits],
    statuses: [...filters.statuses],
    pricingModes: [...filters.pricingModes],
    mappingReadiness: [...filters.mappingReadiness],
  });

  const appliedFilters = ref<LaborFilterSelections>(createEmptyFilters());
  const draftFilters = ref<LaborFilterSelections>(createEmptyFilters());

  const filterGroups = computed<LaborFilterGroup[]>(() => [
    {
      key: 'statuses',
      label: t('labor.filter_status'),
      options: [
        { id: '1', title: t('labor.active') },
        { id: '0', title: t('labor.inactive') },
      ],
    },
    {
      key: 'itemTypes',
      label: t('labor.filter_type'),
      options: itemTypeFilterOptions.value,
    },
    {
      key: 'measurementUnits',
      label: t('labor.filter_unit'),
      options: measurementFilterOptions.value,
    },
    {
      key: 'pricingModes',
      label: t('labor.filter_pricing_mode'),
      options: [
        { id: 'configured', title: t('labor.configured') },
        { id: 'manual_entry', title: t('labor.manual_entry') },
      ],
    },
    {
      key: 'mappingReadiness',
      label: t('labor.filter_mapping_readiness'),
      options: [
        { id: '1', title: t('labor.ready') },
        { id: '0', title: t('labor.not_ready') },
      ],
    },
  ]);

  const appliedFilterCount = computed(() =>
    Object.values(appliedFilters.value).reduce((count, selections) => count + selections.length, 0),
  );

  const activeParam = computed(() => {
    if (appliedFilters.value.statuses.length !== 1) return undefined;
    if (appliedFilters.value.statuses[0] === '1') return 1;
    if (appliedFilters.value.statuses[0] === '0') return 0;
    return undefined;
  });

  const pricingModeParam = computed<LaborPricingMode | undefined>(() => {
    if (appliedFilters.value.pricingModes.length !== 1) return undefined;
    return appliedFilters.value.pricingModes[0] === 'configured' ? 'configured' : 'manual_entry';
  });

  const mappingReadinessParam = computed<0 | 1 | undefined>(() => {
    if (appliedFilters.value.mappingReadiness.length !== 1) return undefined;
    return appliedFilters.value.mappingReadiness[0] === '1' ? 1 : 0;
  });

  const headers: TableHeader[] = [
    { key: 'title', label: 'labor.name' },
    { key: 'itemType', label: 'labor.type' },
    { key: 'measurementUnit', label: 'labor.unit' },
    { key: 'pricingMode', label: 'labor.default_pricing_mode' },
    { key: 'activeMappingCount', label: 'labor.active_mapping_count', align: 'center' },
    { key: 'mappingReady', label: 'labor.mapping_readiness', align: 'center' },
  ];

  const fetchLabors = async (page: number = 1) => {
    await controller.fetchList(
      new IndexLaborParams({
        word: word.value,
        pageNumber: page,
        perPage: perPage.value,
        withPage: 1,
        active: activeParam.value,
        itemTypeIds: appliedFilters.value.itemTypes.map(Number),
        measurementUnitIds: appliedFilters.value.measurementUnits.map(Number),
        defaultPricingMode: pricingModeParam.value,
        mappingReadiness: mappingReadinessParam.value,
      }),
    );
  };

  const parseRoutePage = (queryPage: unknown): number => {
    const pageNumber = Number(queryPage);
    return Number.isInteger(pageNumber) && pageNumber > 0 ? pageNumber : 1;
  };

  const updateRouteQuery = (page: number) =>
    router.push({
      query: {
        ...route.query,
        page: String(page),
        word: word.value || undefined,
        active: undefined,
        item_types: appliedFilters.value.itemTypes.join(',') || undefined,
        measurement_units: appliedFilters.value.measurementUnits.join(',') || undefined,
        statuses: appliedFilters.value.statuses.join(',') || undefined,
        pricing_modes: appliedFilters.value.pricingModes.join(',') || undefined,
        mapping_readiness: appliedFilters.value.mappingReadiness.join(',') || undefined,
        per_page: String(perPage.value),
        sort_by: undefined,
        sort_direction: undefined,
      },
    });

  const search = debounce(() => {
    void updateRouteQuery(1);
    void fetchLabors(1);
  });

  const onPageChange = (page: number) => {
    void fetchLabors(page);
    void updateRouteQuery(page);
  };

  const onPerPageChange = (count: number) => {
    perPage.value = count;
    void updateRouteQuery(1);
    void fetchLabors(1);
  };

  const toggleDraftFilter = (category: LaborFilterCategory, optionId: string) => {
    const categorySelections = draftFilters.value[category];
    draftFilters.value[category] = categorySelections.includes(optionId)
      ? categorySelections.filter((selectedId) => selectedId !== optionId)
      : [...categorySelections, optionId];
  };

  const isDraftFilterSelected = (category: LaborFilterCategory, optionId: string) =>
    draftFilters.value[category].includes(optionId);

  const openFilterDialog = () => {
    draftFilters.value = cloneFilters(appliedFilters.value);
    isFilterDialogOpen.value = true;
  };

  const closeFilterDialog = () => {
    draftFilters.value = cloneFilters(appliedFilters.value);
    isFilterDialogOpen.value = false;
  };

  const toggleFilterDialog = () => {
    if (isFilterDialogOpen.value) {
      closeFilterDialog();
    } else {
      openFilterDialog();
    }
  };

  const applyFilters = async () => {
    appliedFilters.value = cloneFilters(draftFilters.value);
    isFilterDialogOpen.value = false;
    await updateRouteQuery(1);
    await fetchLabors(1);
  };

  const clearFilters = async () => {
    appliedFilters.value = createEmptyFilters();
    draftFilters.value = createEmptyFilters();
    isFilterDialogOpen.value = false;
    await updateRouteQuery(1);
    await fetchLabors(1);
  };

  const deleteLabor = async (id: number) => {
    const deletionState = await controller.delete(new DeleteLaborParams(id));

    if (deletionState instanceof DataSuccess) {
      dialogManager.toastSuccess(t('labor.delete_success'));
      await fetchLabors(1);
    }
  };

  const deleteSelectedLabors = (labors: LaborModel[]) =>
    deleteSelectedRows(
      labors,
      (id) => controller.delete(new DeleteLaborParams(id)),
      () => fetchLabors(1),
    );

  const unitTranslationKeys: Record<UnitTypeEnum, string> = {
    [UnitTypeEnum.meter]: 'labor.units.meter',
    [UnitTypeEnum.bag]: 'labor.units.bag',
    [UnitTypeEnum.box]: 'labor.units.box',
  };

  const getUnitLabel = (labor: LaborModel): string => {
    if (labor.measurementUnit?.title) return labor.measurementUnit.title;
    return unitTranslationKeys[labor.unit] ? t(unitTranslationKeys[labor.unit]) : '—';
  };

  const formatRate = (rate: number): string =>
    new Intl.NumberFormat(locale.value, { maximumFractionDigits: 2 }).format(rate);

  const isSupportedPageSize = (pageSize: number) => [10, 20, 30].includes(pageSize);

  const parseFilterValues = (
    queryValue: unknown,
    isAllowed: (filterValue: string) => boolean,
  ): string[] => {
    const rawValues = Array.isArray(queryValue) ? queryValue.join(',') : String(queryValue ?? '');
    const normalizedValues = rawValues.split(',').map((filterValue) => filterValue.trim());
    return [...new Set(normalizedValues.filter(isAllowed))];
  };

  const isPositiveId = (filterValue: string) => {
    const filterId = Number(filterValue);
    return Number.isInteger(filterId) && filterId > 0;
  };

  const restoreFilters = () => {
    const legacyStatus =
      route.query.active === '0' || route.query.active === '1' ? [route.query.active] : [];
    const routeStatuses = parseFilterValues(
      route.query.statuses,
      (status) => status === '0' || status === '1',
    );

    appliedFilters.value = {
      itemTypes: parseFilterValues(route.query.item_types, isPositiveId),
      measurementUnits: parseFilterValues(route.query.measurement_units, isPositiveId),
      statuses: routeStatuses.length > 0 ? routeStatuses : legacyStatus,
      pricingModes: parseFilterValues(
        route.query.pricing_modes,
        (mode) => mode === 'configured' || mode === 'manual_entry',
      ),
      mappingReadiness: parseFilterValues(
        route.query.mapping_readiness,
        (readiness) => readiness === '0' || readiness === '1',
      ),
    };
    draftFilters.value = cloneFilters(appliedFilters.value);
  };

  const fetchFilterOptions = async () => {
    filtersLoading.value = true;

    try {
      const [itemTypes, measurementUnits] = await Promise.all([
        itemTypesController.fetchAsOptions(new IndexItemTypesParams('', 1, 1000, 0)),
        measurementController.fetchAsOptions(new IndexMeasurementParams('', 1, 1000, 0)),
      ]);

      itemTypeFilterOptions.value = itemTypes.map((option) => ({
        id: String(option.id),
        title: option.title,
      }));
      measurementFilterOptions.value = measurementUnits.map((option) => ({
        id: String(option.id),
        title: option.title,
      }));
    } finally {
      filtersLoading.value = false;
    }
  };

  const restorePageSize = () => {
    const routePageSize = Number(route.query.per_page);
    perPage.value = isSupportedPageSize(routePageSize) ? routePageSize : 10;
  };

  onMounted(async () => {
    word.value = route.query.word ? String(route.query.word) : '';
    restoreFilters();
    restorePageSize();
    await Promise.all([fetchLabors(parseRoutePage(route.query.page)), fetchFilterOptions()]);
  });
  const { user } = useUserStore();
</script>

<template>
  <div class="labor-page">
    <div class="labor-header">
      <div>
        <h4>{{ $t('labor.list_title') }}</h4>
        <p>{{ $t('labor.list_description') }}</p>
      </div>
      <div class="toolbar">
        <div class="toolbar-filters">
          <div class="search-field">
            <span class="search-icon">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </span>
            <input
              v-model="word"
              :placeholder="$t('labor.search_placeholder')"
              class="search-input"
              type="text"
              @input="search"
            />
          </div>

          <div class="labor-filter" @keydown.esc="closeFilterDialog">
            <button
              type="button"
              class="labor-filter-button"
              :class="{ active: appliedFilterCount > 0 }"
              aria-haspopup="dialog"
              :aria-expanded="isFilterDialogOpen"
              aria-controls="labor-filters-dialog"
              @click="toggleFilterDialog"
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
                aria-hidden="true"
              >
                <path d="M4 5h16" />
                <path d="M7 12h10" />
                <path d="M10 19h4" />
              </svg>

              <span>{{ $t('labor.filters') }}</span>
              <span v-if="appliedFilterCount" class="labor-filter-total">
                {{ appliedFilterCount }}
              </span>
            </button>

            <div
              v-if="isFilterDialogOpen"
              class="labor-filter-backdrop"
              @pointerdown.self="closeFilterDialog"
            >
              <div
                id="labor-filters-dialog"
                class="labor-filter-dialog"
                role="dialog"
                aria-modal="true"
                :aria-label="$t('labor.filters')"
              >
                <header class="labor-filter-header">
                  <div>
                    <h3>{{ $t('labor.filters_title') }}</h3>
                    <p>{{ $t('labor.filters_description') }}</p>
                  </div>
                  <button
                    type="button"
                    class="labor-filter-close"
                    :aria-label="$t('close')"
                    @click="closeFilterDialog"
                  >
                    ×
                  </button>
                </header>

                <div class="labor-filter-content">
                  <div v-if="filtersLoading" class="labor-filter-state">
                    {{ $t('labor.filters_loading') }}
                  </div>

                  <div v-else class="labor-filter-groups">
                    <fieldset
                      v-for="group in filterGroups"
                      :key="group.key"
                      class="labor-filter-group"
                    >
                      <legend>{{ group.label }}</legend>

                      <div v-if="group.options.length" class="labor-filter-options">
                        <label
                          v-for="option in group.options"
                          :key="option.id"
                          class="labor-filter-option"
                        >
                          <input
                            type="checkbox"
                            :value="option.id"
                            :data-filter-category="group.key"
                            :checked="isDraftFilterSelected(group.key, option.id)"
                            @change="toggleDraftFilter(group.key, option.id)"
                          />
                          <span>{{ option.title }}</span>
                        </label>
                      </div>

                      <p v-else class="labor-filter-empty">{{ $t('labor.filter_no_options') }}</p>
                    </fieldset>
                  </div>
                </div>

                <footer class="labor-filter-actions">
                  <button type="button" class="labor-filter-apply" @click="applyFilters">
                    {{ $t('labor.apply_filters') }}
                  </button>
                  <button type="button" class="labor-filter-clear" @click="clearFilters">
                    {{ $t('labor.clear_filters') }}
                  </button>
                </footer>
              </div>
            </div>
          </div>
        </div>
        <router-link
          class="btn btn-primary"
          :to="user?.type === 1 ? '/admin/labor/add' : '/organization/labor/add'"
        >
          <IndexAddIcon /> {{ $t('labor.add') }}
        </router-link>
      </div>
    </div>

    <DataStatusBuilder :controller="state" :on-retry="async () => await fetchLabors()">
      <template #success="{ data }">
        <AppTable
          :headers="headers"
          :items="data as LaborModel[]"
          :bulk-delete="deleteSelectedLabors"
          selectable
          show-index
          hoverable
          striped
        >
          <template #cell-itemType="{ item }">
            <span>{{ item.itemType?.title || '—' }}</span>
          </template>

          <template #cell-measurementUnit="{ item }">
            <span>{{ getUnitLabel(item) }}</span>
          </template>

          <template #cell-pricingMode="{ item }">
            <div class="pricing-mode">
              <span :class="['status-badge', item.pricingMode]">
                {{ $t(`labor.${item.pricingMode}`) }}
              </span>
              <span v-if="item.pricingMode === 'configured'" class="configured-rate">
                {{ formatRate(item.price) }} {{ $t('labor.currency') }}
              </span>
            </div>
          </template>

          <template #cell-activeMappingCount="{ item }">
            <span class="mapping-count">{{ item.activeMappingCount }}</span>
          </template>

          <template #cell-mappingReady="{ item }">
            <span :class="['status-badge', item.mappingReady ? 'ready' : 'not-ready']">
              {{ $t(item.mappingReady ? 'labor.ready' : 'labor.not_ready') }}
            </span>
          </template>

          <template #actions="{ item }">
            <div class="row-actions">
              <ChangeStatusButton
                :id="item.id!"
                :key="`${item.id}-${item.status}`"
                :initial-is-active="item.status"
                :type="StatusTypeEnum.LABOR"
                @reload="fetchLabors"
              />

              <router-link
                class="action-btn edit"
                :to="
                  user?.type === 1
                    ? `/admin/labor/edit/${item.id}`
                    : `/organization/labor/edit/${item.id}`
                "
                :title="$t('labor.edit')"
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
              <DeleteDialog
                :title="$t('labor.delete_title')"
                :message="$t('labor.delete_message')"
                :hasbtn="true"
                @delete="deleteLabor(item.id!)"
              >
                <template #btn>
                  <button class="action-btn delete" :title="$t('common.delete')">
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
          <h3>{{ $t('labor.empty_title') }}</h3>
          <p>{{ $t('labor.empty_description') }}</p>
          <router-link
            class="btn btn-primary"
            :to="user?.type === 1 ? '/admin/labor/add' : '/organization/labor/add'"
          >
            {{ $t('labor.add') }}
          </router-link>
        </div>
      </template>

      <template #loader>
        <TableSkelaton
          :rows="5"
          :columns="headers.length"
          :has-actions="true"
          :show-index="true"
          :selectable="true"
        />
      </template>
    </DataStatusBuilder>
  </div>
</template>

<style scoped lang="scss">
  .labor-header {
    flex-direction: column !important;
  }

  .labor-page,
  .labor-header,
  .row-actions {
    display: flex;
  }

  .toolbar {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 1rem;
  }

  .toolbar-filters {
    display: flex;
    align-items: flex-end;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .labor-page {
    flex-direction: column;
    gap: 1.5rem;
  }

  .labor-header {
    justify-content: space-between;
    gap: 1rem;
  }

  .labor-header p,
  .empty-state p {
    color: var(--gray-5);
  }

  .row-actions {
    align-items: center;
    gap: 0.75rem;
  }

  .pricing-mode {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.35rem;
  }

  .status-badge,
  .mapping-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 1.75rem;
    padding: 0.25rem 0.65rem;
    border-radius: 999px;
    font-size: 0.8rem;
    font-weight: 600;
    white-space: nowrap;
  }

  .status-badge.configured,
  .status-badge.ready {
    color: var(--success-dark);
    background: var(--success-light);
  }

  .status-badge.manual_entry,
  .mapping-count {
    color: var(--gray-700);
    background: var(--gray-100);
  }

  .status-badge.not-ready {
    color: var(--danger-dark);
    background: var(--danger-light);
  }

  .configured-rate {
    color: var(--gray-600);
    font-size: 0.78rem;
    white-space: nowrap;
  }

  .labor-filter {
    position: relative;
    flex-shrink: 0;
  }

  .labor-filter-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--xs-size-4);
    min-height: 40px;
    padding: var(--xs-size) var(--md-size);
    color: var(--title-card-color);
    background: var(--bg-card);
    border: 1px solid var(--input-border-color);
    border-radius: var(--radius-sm);
    font-size: var(--sm-size);
    font-weight: 600;
    white-space: nowrap;
    cursor: pointer;
    transition: var(--transition-fast);

    &:hover,
    &.active {
      color: var(--PrimaryColor);
      background: var(--PrimaryColor-light);
      border-color: var(--PrimaryColor);
    }

    &:focus-visible {
      outline: none;
      box-shadow: 0 0 0 3px var(--PrimaryColor-alpha-15);
    }
  }

  .labor-filter-total {
    display: inline-grid;
    min-width: 1.4rem;
    min-height: 1.4rem;
    padding-inline: var(--xs-size-5);
    color: var(--standard-white);
    background: var(--PrimaryColor);
    border-radius: var(--radius-full);
    font-size: var(--xs-size-2);
    place-items: center;
  }

  .labor-filter-backdrop {
    position: fixed;
    z-index: 1000;
    inset: 0;
    display: grid;
    padding: var(--md-size);
    background: var(--overlay-bg);
    place-items: center;
  }

  .labor-filter-dialog {
    display: flex;
    width: min(46rem, 100%);
    max-height: calc(100vh - (var(--md-size) * 2));
    flex-direction: column;
    overflow: hidden;
    background: var(--bg-card);
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
  }

  .labor-filter-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--sm-size);
    padding: var(--md-size);
    border-bottom: 1px solid var(--border-weak);

    h3,
    p {
      margin: 0;
    }

    h3 {
      color: var(--title-card-color);
      font-size: var(--md-size);
    }

    p {
      margin-top: var(--xs-size-4);
      color: var(--subtitle-color);
      font-size: var(--xs-size);
    }
  }

  .labor-filter-close {
    display: grid;
    flex: 0 0 2rem;
    width: 2rem;
    height: 2rem;
    padding: 0;
    color: var(--gray-600);
    background: var(--gray-100);
    border: 0;
    border-radius: var(--radius-full);
    font-size: var(--lg-size);
    cursor: pointer;
    place-items: center;
  }

  .labor-filter-content {
    min-height: 0;
    overflow-y: auto;
    padding: var(--md-size);
  }

  .labor-filter-state,
  .labor-filter-empty {
    color: var(--subtitle-color);
    font-size: var(--sm-size);
    text-align: center;
  }

  .labor-filter-groups {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--sm-size);
  }

  .labor-filter-group {
    min-width: 0;
    padding: var(--sm-size);
    background: var(--bg-section);
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-md);

    legend {
      padding-inline: var(--xs-size-4);
      color: var(--title-card-color);
      font-size: var(--sm-size);
      font-weight: 700;
    }
  }

  .labor-filter-options {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--xs-size-4);
    max-height: 9rem;
    overflow-y: auto;
  }

  .labor-filter-option {
    display: flex;
    align-items: center;
    gap: var(--xs-size-3);
    min-width: 0;
    padding: var(--xs-size-4);
    color: var(--gray-700);
    background: var(--bg-card);
    border-radius: var(--radius-xs);
    font-size: var(--xs-size);
    cursor: pointer;

    span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
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

  .labor-filter-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--xs-size-3);
    padding: var(--sm-size);
    background: var(--bg-section);
    border-top: 1px solid var(--border-weak);

    button {
      min-height: 2.5rem;
      border-radius: var(--radius-xs);
      font-size: var(--sm-size);
      font-weight: 600;
      cursor: pointer;
    }
  }

  .labor-filter-apply {
    color: var(--standard-white);
    background: var(--PrimaryColor);
    border: 1px solid var(--PrimaryColor);
  }

  .labor-filter-clear {
    color: var(--gray-700);
    background: var(--bg-card);
    border: 1px solid var(--border-weak);
  }

  .empty-state {
    padding: 3rem 1rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }

  @media (max-width: 768px) {
    .toolbar,
    .toolbar-filters {
      align-items: stretch;
      flex-direction: column;
    }

    .labor-filter-button {
      width: 100%;
    }

    .labor-filter-backdrop {
      padding: var(--sm-size);
    }

    .labor-filter-groups,
    .labor-filter-options {
      grid-template-columns: 1fr;
    }
  }
</style>
