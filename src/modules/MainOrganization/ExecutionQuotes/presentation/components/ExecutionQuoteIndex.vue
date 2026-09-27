<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useRouter } from 'vue-router';

  import type TitleInterface from '@/base/Data/Models/titleInterface';
  import IndexClientParams from '@/modules/MainOrganization/client/core/params/index.client.params';
  import ClientController from '@/modules/MainOrganization/client/presentation/controllers/client.controller';
  import IndexProjectParams from '@/modules/MainOrganization/Project/core/params/index.project.params';
  import ProjectController from '@/modules/MainOrganization/Project/presentation/controllers/project.controller';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import AppTable, { type TableHeader } from '@/shared/HelpersComponents/AppTable.vue';
  import Pagination from '@/shared/HelpersComponents/Pagination.vue';
  import {
    ExecutionQuoteTypeEnum,
    getExecutionQuoteTypeTitleKey,
    type ExecutionQuoteType,
  } from '../../core/constants/execution.quote.type.enum';
  import { getQuoteSourceTitleKey, QuoteSourceEnum } from '../../core/constants/quote.source.enum';
  import type ExecutionQuoteShowModel from '../../core/models/execution.quote.show.model';
  import IndexExecutionQuoteParams from '../../core/params/index.execution.quote.params';
  import ExecutionQuoteController from '../controllers/execution.quote.controller';

  type FilterSelection = TitleInterface<string | number> | TitleInterface<string | number>[] | null;

  type ExecutionQuoteFilterIds = {
    quoteSource?: number;
    projectId?: number;
    clientId?: number;
    quoteTypeId?: number;
  };

  const controller = ExecutionQuoteController.getInstance();
  const clientController = ClientController.getInstance();
  const projectController = ProjectController.getInstance();
  const router = useRouter();
  const { locale, t } = useI18n();
  const state = computed(() => controller.listState.value);
  const perPage = ref(20);
  const selectedQuoteSource = ref<FilterSelection>(null);
  const selectedProject = ref<FilterSelection>(null);
  const selectedClient = ref<FilterSelection>(null);
  const selectedQuoteType = ref<FilterSelection>(null);
  const appliedFilters = ref<ExecutionQuoteFilterIds>({});

  const clientParams = new IndexClientParams('', 1, 100, 0);
  const projectParams = new IndexProjectParams('', 1, 100, 0);

  const quoteSourceOptions = computed<TitleInterface<number>[]>(() => [
    {
      id: QuoteSourceEnum.EXECUTION_ONLY,
      title: t(getQuoteSourceTitleKey(QuoteSourceEnum.EXECUTION_ONLY)),
    },
    {
      id: QuoteSourceEnum.EXECUTION_FROM_DESIGN_QUOTE,
      title: t(getQuoteSourceTitleKey(QuoteSourceEnum.EXECUTION_FROM_DESIGN_QUOTE)),
    },
  ]);

  const quoteTypeOptions = computed<TitleInterface<number>[]>(() =>
    Object.values(ExecutionQuoteTypeEnum).map((quoteType) => ({
      id: quoteType,
      title: t(getExecutionQuoteTypeTitleKey(quoteType)),
    })),
  );

  const selectedFilterId = (selection: FilterSelection): number | undefined => {
    if (!selection || Array.isArray(selection)) return undefined;

    const filterId = Number(selection.id);
    return Number.isInteger(filterId) && filterId > 0 ? filterId : undefined;
  };

  const selectedFilters = computed<ExecutionQuoteFilterIds>(() => ({
    quoteSource: selectedFilterId(selectedQuoteSource.value),
    projectId: selectedFilterId(selectedProject.value),
    clientId: selectedFilterId(selectedClient.value),
    quoteTypeId: selectedFilterId(selectedQuoteType.value),
  }));

  const selectedFilterCount = computed(
    () => Object.values(selectedFilters.value).filter((filterId) => filterId !== undefined).length,
  );

  const activeFilterCount = computed(
    () => Object.values(appliedFilters.value).filter((filterId) => filterId !== undefined).length,
  );

  const filtersHaveChanges = computed(
    () =>
      selectedFilters.value.quoteSource !== appliedFilters.value.quoteSource ||
      selectedFilters.value.projectId !== appliedFilters.value.projectId ||
      selectedFilters.value.clientId !== appliedFilters.value.clientId ||
      selectedFilters.value.quoteTypeId !== appliedFilters.value.quoteTypeId,
  );

  const fetchQuotes = async (page: number = 1) => {
    await controller.fetchList(
      new IndexExecutionQuoteParams({
        page,
        perPage: perPage.value,
        ...appliedFilters.value,
      }),
    );
  };

  const applyFilters = () => {
    appliedFilters.value = { ...selectedFilters.value };
    void fetchQuotes(1);
  };

  const clearFilters = () => {
    selectedQuoteSource.value = null;
    selectedProject.value = null;
    selectedClient.value = null;
    selectedQuoteType.value = null;
    appliedFilters.value = {};
    void fetchQuotes(1);
  };

  const onPageChange = (page: number) => {
    void fetchQuotes(page);
  };

  const onPerPageChange = (count: number) => {
    perPage.value = count;
    void fetchQuotes(1);
  };

  onMounted(() => void fetchQuotes());

  const openAdd = () => {
    void router.push({ name: 'Add Execution Quote' });
  };

  const openShow = (quote: ExecutionQuoteShowModel) => {
    if (!quote.id) return;

    void router.push({ name: 'Show Execution Quote', params: { id: String(quote.id) } });
  };

  const headers: TableHeader[] = [
    { key: 'quoteSource', label: 'execution_quote.table.source' },
    { key: 'project', label: 'execution_quote.table.project' },
    { key: 'client', label: 'execution_quote.table.client' },
    { key: 'quoteType', label: 'execution_quote.table.quote_type' },
    { key: 'priceEmployee', label: 'execution_quote.fields.price_employee' },
    { key: 'quoteProgress', label: 'execution_quote.table.stages_and_items' },
    { key: 'createdAt', label: 'execution_quote.table.created_at' },
  ];

  const quoteSourceLabel = (quote: ExecutionQuoteShowModel) => {
    const titleKey = getQuoteSourceTitleKey(quote.quoteSource);
    return titleKey ? t(titleKey) : '—';
  };

  const quoteTypeLabel = (quote: ExecutionQuoteShowModel) => {
    const quoteType = quote.quoteType?.id as ExecutionQuoteType | undefined;
    const isKnownType = quoteType && Object.values(ExecutionQuoteTypeEnum).includes(quoteType);

    if (isKnownType) return t(getExecutionQuoteTypeTitleKey(quoteType));

    return quote.quoteType?.title?.replace(/_/g, ' ') ?? '—';
  };

  const formatDate = (rawDate: string | undefined) => {
    if (!rawDate) return '—';

    const date = new Date(rawDate.includes(' ') ? rawDate.replace(' ', 'T') : rawDate);
    if (Number.isNaN(date.getTime())) return rawDate;

    return new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium' }).format(date);
  };

  const asExecutionQuotes = (quotes: unknown): ExecutionQuoteShowModel[] =>
    Array.isArray(quotes) ? (quotes as ExecutionQuoteShowModel[]) : [];
</script>

<template>
  <section class="execution-quote-index">
    <div class="execution-quote-index__header">
      <div>
        <h1>{{ $t('execution_quote.title') }}</h1>
        <p>{{ $t('execution_quote.index_description') }}</p>
      </div>
      <AppButton icon="right" @click="openAdd">
        <template #icon>
          <i class="pi pi-plus" aria-hidden="true"></i>
        </template>
        {{ $t('execution_quote.new_quote') }}
      </AppButton>
    </div>

    <section class="execution-quote-index__filters" aria-labelledby="execution-quote-filters-title">
      <header class="execution-quote-index__filters-heading">
        <div class="execution-quote-index__filters-title">
          <i class="pi pi-sliders-h" aria-hidden="true"></i>
          <h2 id="execution-quote-filters-title">
            {{ $t('execution_quote.filters.title') }}
          </h2>
        </div>

        <span
          v-if="activeFilterCount"
          class="execution-quote-index__filters-count"
          aria-live="polite"
        >
          {{ $t('execution_quote.filters.active_count', { count: activeFilterCount }) }}
        </span>
      </header>

      <div class="execution-quote-index__filters-grid">
        <div class="execution-quote-index__filter-field">
          <UpdatedCustomInputSelect
            id="execution-quote-source-filter"
            v-model="selectedQuoteSource"
            label="execution_quote.filters.source"
            :placeholder="$t('execution_quote.filters.source_placeholder')"
            :static-options="quoteSourceOptions"
            :reload="false"
          />
        </div>

        <div class="execution-quote-index__filter-field">
          <UpdatedCustomInputSelect
            id="execution-quote-project-filter"
            v-model="selectedProject"
            label="execution_quote.filters.project"
            :placeholder="$t('execution_quote.filters.project_placeholder')"
            :controller="projectController"
            :params="projectParams"
            :reload="false"
          />
        </div>

        <div class="execution-quote-index__filter-field">
          <UpdatedCustomInputSelect
            id="execution-quote-client-filter"
            v-model="selectedClient"
            label="execution_quote.filters.client"
            :placeholder="$t('execution_quote.filters.client_placeholder')"
            :controller="clientController"
            :params="clientParams"
            :reload="false"
          />
        </div>

        <div class="execution-quote-index__filter-field">
          <UpdatedCustomInputSelect
            id="execution-quote-type-filter"
            v-model="selectedQuoteType"
            label="execution_quote.filters.quote_type"
            :placeholder="$t('execution_quote.filters.quote_type_placeholder')"
            :static-options="quoteTypeOptions"
            :reload="false"
          />
        </div>

        <div class="execution-quote-index__filter-actions">
          <AppButton
            class="execution-quote-index__filter-clear"
            theme="secondary"
            outline
            :disabled="selectedFilterCount === 0 && activeFilterCount === 0"
            @click="clearFilters"
          >
            {{ $t('execution_quote.filters.clear') }}
          </AppButton>
          <AppButton
            class="execution-quote-index__filter-apply"
            icon="right"
            :disabled="!filtersHaveChanges"
            @click="applyFilters"
          >
            <template #icon>
              <i class="pi pi-search" aria-hidden="true"></i>
            </template>
            {{ $t('execution_quote.filters.apply') }}
          </AppButton>
        </div>
      </div>
    </section>

    <DataStatusBuilder :controller="state">
      <template #success="{ data: quotes }">
        <section class="execution-quote-index__table-card">
          <header class="execution-quote-index__table-header">
            <div>
              <span class="execution-quote-index__table-icon" aria-hidden="true">
                <i class="pi pi-file-edit"></i>
              </span>
              <div>
                <h2>{{ $t('execution_quote.table.title') }}</h2>
                <p>{{ $t('execution_quote.table.description') }}</p>
              </div>
            </div>
            <span class="execution-quote-index__result-count">
              {{
                $t('execution_quote.table.results_count', {
                  count: asExecutionQuotes(quotes).length,
                })
              }}
            </span>
          </header>

          <AppTable
            :headers="headers"
            :items="asExecutionQuotes(quotes)"
            row-key="id"
            striped
            hoverable
            empty-message="execution_quote.empty_quotes"
            @row-click="openShow"
          >
            <template #cell-quoteSource="{ item }">
              <span class="execution-quote-index__badge">
                {{ quoteSourceLabel(item) }}
              </span>
            </template>

            <template #cell-project="{ item }">
              <div class="execution-quote-index__primary-cell">
                <strong>{{ item.project?.title ?? '—' }}</strong>
              </div>
            </template>

            <template #cell-client="{ item }">
              <div class="execution-quote-index__primary-cell">
                <strong>{{ item.client?.name ?? '—' }}</strong>
                <small>{{ item.client?.phone ?? '—' }}</small>
              </div>
            </template>

            <template #cell-quoteType="{ item }">
              <span class="execution-quote-index__type">
                {{ quoteTypeLabel(item) }}
              </span>
            </template>

            <template #cell-priceEmployee="{ item }">
              <div class="execution-quote-index__primary-cell">
                <strong>{{ item.priceEmployee?.name ?? '—' }}</strong>
              </div>
            </template>

            <template #cell-quoteProgress="{ item }">
              <div class="execution-quote-index__progress">
                <strong>
                  {{ $t('execution_quote.table.stages_count', { count: item.quoteStagesCount }) }}
                </strong>
                <small>
                  {{
                    $t('execution_quote.table.items_count_value', { count: item.quoteItemsCount })
                  }}
                </small>
              </div>
            </template>

            <template #cell-createdAt="{ item }">
              <time :datetime="item.createdAt">
                {{ formatDate(item.createdAt) }}
              </time>
            </template>

            <template #actions="{ item }">
              <AppButton size="sm" theme="secondary" outline @click="openShow(item)">
                {{ $t('execution_quote.show.action') }}
              </AppButton>
            </template>
          </AppTable>
        </section>
        <Pagination
          :pagination="controller.pagination.value"
          show-single-page
          @change-page="onPageChange"
          @count-per-page="onPerPageChange"
        />
      </template>
    </DataStatusBuilder>
  </section>
</template>

<style scoped lang="scss">
  .execution-quote-index {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .execution-quote-index__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    animation: execution-quote-index-enter 360ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
  }

  .execution-quote-index__header h1,
  .execution-quote-index__header p {
    margin: 0;
  }

  .execution-quote-index__header p {
    color: var(--subtitle-color);
  }

  .execution-quote-index__filters,
  .execution-quote-index__table-card {
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-lg);
    background: var(--bg-card);
    box-shadow: var(--shadow-sm);
    transition:
      border-color var(--transition-fast),
      box-shadow var(--transition-fast);
  }

  .execution-quote-index__filters {
    display: grid;
    gap: 0.75rem;
    padding: 0.9rem 1rem 1rem;
    animation: execution-quote-index-enter 400ms 50ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
  }

  .execution-quote-index__filters:focus-within,
  .execution-quote-index__table-card:hover {
    border-color: var(--PrimaryColor-alpha-30);
  }

  .execution-quote-index__table-card:hover {
    box-shadow: var(--shadow-md);
  }

  .execution-quote-index__filters-heading,
  .execution-quote-index__filters-title,
  .execution-quote-index__filter-actions,
  .execution-quote-index__table-header,
  .execution-quote-index__table-header > div {
    display: flex;
    align-items: center;
  }

  .execution-quote-index__filters-heading,
  .execution-quote-index__table-header {
    justify-content: space-between;
    gap: 1rem;
  }

  .execution-quote-index__filters-title,
  .execution-quote-index__table-header > div {
    min-width: 0;
    gap: 0.55rem;
  }

  .execution-quote-index__filters-title h2,
  .execution-quote-index__table-header h2,
  .execution-quote-index__table-header p {
    margin: 0;
  }

  .execution-quote-index__filters-title h2,
  .execution-quote-index__table-header h2 {
    color: var(--title-card-color);
    font-size: 1rem;
  }

  .execution-quote-index__table-header p {
    color: var(--subtitle-color);
    font-size: var(--xs-size);
  }

  .execution-quote-index__table-icon {
    display: grid;
    width: 2.65rem;
    height: 2.65rem;
    flex: 0 0 auto;
    place-items: center;
    border-radius: 0.8rem 0.8rem 0.25rem;
    background: var(--PrimaryColor-light);
    color: var(--PrimaryColor);
  }

  .execution-quote-index__filters-title > i {
    color: var(--PrimaryColor);
    font-size: 0.95rem;
  }

  .execution-quote-index__filters-count,
  .execution-quote-index__result-count {
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    padding: 0.35rem 0.7rem;
    border-radius: var(--radius-full);
    background: var(--PrimaryColor-alpha-10);
    color: var(--PrimaryColor);
    font-size: var(--xs-size);
    font-weight: 700;
  }

  .execution-quote-index__filters-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(10rem, 1fr)) auto;
    align-items: end;
    gap: 0.65rem;
  }

  .execution-quote-index__filter-field {
    min-width: 0;
  }

  .execution-quote-index__filter-field :deep(.input-label) {
    color: var(--title-card-color);
    font-size: var(--xs-size);
    font-weight: 600;
  }

  .execution-quote-index__filter-field :deep(.p-select) {
    min-height: 2.75rem;
    border-radius: var(--radius-sm);
    background: var(--bg-card);
    transition:
      border-color var(--transition-fast),
      box-shadow var(--transition-fast);
  }

  .execution-quote-index__filter-field :deep(.p-select:hover),
  .execution-quote-index__filter-field :deep(.p-select.p-focus) {
    border-color: var(--PrimaryColor-alpha-50);
    box-shadow: 0 0 0 2px var(--PrimaryColor-alpha-10);
  }

  .execution-quote-index__filter-actions {
    gap: 0.6rem;
  }

  .execution-quote-index__filter-actions :deep(button) {
    min-width: 6.75rem;
    min-height: 2.75rem;
  }

  .execution-quote-index__table-card {
    overflow: hidden;
    animation: execution-quote-index-enter 420ms 80ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
  }

  .execution-quote-index__table-header {
    padding: 1rem 1.1rem;
    border-bottom: 1px solid var(--border-weak);
    background: var(--bg-section);
  }

  .execution-quote-index__badge,
  .execution-quote-index__type {
    display: inline-flex;
    align-items: center;
    width: fit-content;
    padding: 0.3rem 0.6rem;
    border-radius: var(--radius-full);
    font-size: var(--xs-size);
    font-weight: 700;
    transition:
      background-color var(--transition-fast),
      transform var(--transition-fast);
  }

  .execution-quote-index__badge {
    background: var(--PrimaryColor-light);
    color: var(--PrimaryColor);
  }

  .execution-quote-index__type {
    background: var(--gray-100);
    color: var(--gray-700);
  }

  .execution-quote-index__primary-cell,
  .execution-quote-index__progress {
    display: grid;
    gap: 0.2rem;
  }

  .execution-quote-index__primary-cell strong,
  .execution-quote-index__progress strong {
    color: var(--title-card-color);
  }

  .execution-quote-index__primary-cell small,
  .execution-quote-index__progress small,
  .execution-quote-index time {
    color: var(--subtitle-color);
    font-size: var(--xs-size);
  }

  .execution-quote-index :deep(.app-table-wrapper) {
    animation: execution-quote-index-enter 420ms 120ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
  }

  .execution-quote-index :deep(.table-responsive) {
    border-radius: 0;
  }

  .execution-quote-index :deep(.app-table thead th) {
    background: var(--bg-card);
    color: var(--subtitle-color);
    font-size: var(--xs-size);
    letter-spacing: 0.01em;
  }

  .execution-quote-index :deep(.app-table tbody tr) {
    cursor: pointer;
  }

  .execution-quote-index :deep(.hoverable tbody tr > td) {
    transition:
      background-color var(--transition-fast),
      box-shadow var(--transition-fast);
  }

  .execution-quote-index :deep(.hoverable tbody tr:hover > td) {
    background: var(--PrimaryColor-alpha-4);
  }

  .execution-quote-index :deep(.hoverable tbody tr:hover .execution-quote-index__badge),
  .execution-quote-index :deep(.hoverable tbody tr:hover .execution-quote-index__type) {
    transform: translateY(-1px);
  }

  @keyframes execution-quote-index-enter {
    from {
      opacity: 0;
      transform: translateY(0.65rem);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 640px) {
    .execution-quote-index__header {
      align-items: flex-start;
      flex-direction: column;
    }

    .execution-quote-index__header :deep(button),
    .execution-quote-index__filter-actions,
    .execution-quote-index__filter-actions :deep(button) {
      width: 100%;
    }

    .execution-quote-index__filters-heading,
    .execution-quote-index__table-header {
      align-items: stretch;
      flex-direction: column;
    }

    .execution-quote-index__filters-grid {
      grid-template-columns: 1fr;
    }

    .execution-quote-index__filter-actions {
      flex-direction: column-reverse;
    }

    .execution-quote-index__filters-count,
    .execution-quote-index__result-count {
      align-self: flex-start;
    }
  }

  @media (min-width: 641px) and (max-width: 1100px) {
    .execution-quote-index__filters-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .execution-quote-index__filter-actions {
      grid-column: 1 / -1;
      justify-content: flex-end;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .execution-quote-index__header,
    .execution-quote-index__filters,
    .execution-quote-index__table-card,
    .execution-quote-index :deep(.app-table-wrapper) {
      animation: none;
    }

    .execution-quote-index__filters,
    .execution-quote-index__table-card,
    .execution-quote-index__badge,
    .execution-quote-index__type,
    .execution-quote-index :deep(.hoverable tbody tr > td) {
      transition: none;
    }

    .execution-quote-index :deep(.hoverable tbody tr:hover .execution-quote-index__badge),
    .execution-quote-index :deep(.hoverable tbody tr:hover .execution-quote-index__type) {
      transform: none;
    }
  }
</style>
