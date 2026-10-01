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
  import QuoteStatusBadge from './QuoteStatusBadge.vue';
  import {
    ExecutionQuoteTypeEnum,
    getExecutionQuoteTypeTitleKey,
    type ExecutionQuoteType,
  } from '../../core/constants/execution.quote.type.enum';
  import { getQuoteSourceTitleKey, QuoteSourceEnum } from '../../core/constants/quote.source.enum';
  import { QuoteStatusEnum } from '../../core/constants/quote.status.enum';
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

  const openAddStage = (quote: ExecutionQuoteShowModel) => {
    if (!quote.id) return;

    void router.push({
      name: 'Build Execution Quote',
      query: { id: String(quote.id) },
    });
  };

  const openAddItem = (quote: ExecutionQuoteShowModel) => {
    if (!quote.id) return;

    const existingStageId = quote.quoteStages.find((quoteStage) => quoteStage.stageId)?.stageId;
    void router.push({
      name: 'Build Execution Quote',
      ...(existingStageId ? { params: { stageId: String(existingStageId) } } : {}),
      query: { id: String(quote.id) },
    });
  };

  const canModifyQuote = (quote: ExecutionQuoteShowModel): boolean => {
    return quote.quoteStatus !== QuoteStatusEnum.SENT_TO_CLIENT;
  };

  const headers: TableHeader[] = [
    { key: 'quoteSource', label: 'execution_quote.table.source' },
    { key: 'project', label: 'execution_quote.table.project' },
    { key: 'client', label: 'execution_quote.table.client' },
    { key: 'quoteType', label: 'execution_quote.table.quote_type' },
    { key: 'priceEmployee', label: 'execution_quote.fields.price_employee' },
    { key: 'totalQuotePrice', label: 'execution_quote.table.total_quote_price' },
    { key: 'quoteProgress', label: 'execution_quote.table.status_and_progress' },
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

  const quoteProgressState = (quote: ExecutionQuoteShowModel) => {
    if (quote.quoteItemsCount > 0) return 'ready';
    if (quote.quoteStagesCount > 0) return 'building';
    return 'draft';
  };

  const quoteProgressLabel = (quote: ExecutionQuoteShowModel) =>
    t(`execution_quote.table.progress_${quoteProgressState(quote)}`);

  const clientStatusLabel = (status: number) =>
    t(status === 1 ? 'execution_quote.show.active' : 'execution_quote.show.inactive');

  const formatDate = (rawDate: string | undefined) => {
    if (!rawDate) return '—';

    const date = new Date(rawDate.includes(' ') ? rawDate.replace(' ', 'T') : rawDate);
    if (Number.isNaN(date.getTime())) return rawDate;

    return new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium' }).format(date);
  };

  const formatAmount = (amount: number | undefined) => {
    if (amount === undefined) return '—';

    return new Intl.NumberFormat(locale.value, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const asExecutionQuotes = (quotes: unknown): ExecutionQuoteShowModel[] =>
    Array.isArray(quotes) ? (quotes as ExecutionQuoteShowModel[]) : [];
</script>

<template>
  <section class="execution-quote-index">
    <header class="execution-quote-index__masthead">
      <div class="execution-quote-index__heading-copy">
        <h1>{{ $t('execution_quote.title') }}</h1>
        <p>{{ $t('execution_quote.index_description') }}</p>
      </div>
      <div class="execution-quote-index__masthead-action">
        <AppButton icon="right" @click="openAdd">
          <template #icon>
            <i class="pi pi-plus" aria-hidden="true"></i>
          </template>
          {{ $t('execution_quote.new_quote') }}
        </AppButton>
      </div>
    </header>

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

        <div class="execution-quote-index__filter-group">
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
              <h2>{{ $t('execution_quote.table.title') }}</h2>
              <p>{{ $t('execution_quote.table.description') }}</p>
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
            flush
            min-width="1210px"
            row-clickable
            striped
            hoverable
            empty-message="execution_quote.empty_quotes"
            @row-click="openShow"
          >
            <template #cell-quoteSource="{ item }">
              <span
                class="execution-quote-index__badge"
                :class="{
                  'execution-quote-index__badge--design':
                    item.quoteSource === QuoteSourceEnum.EXECUTION_FROM_DESIGN_QUOTE,
                }"
              >
                <i
                  :class="
                    item.quoteSource === QuoteSourceEnum.EXECUTION_FROM_DESIGN_QUOTE
                      ? 'pi pi-file-check'
                      : 'pi pi-bolt'
                  "
                  aria-hidden="true"
                ></i>
                {{ quoteSourceLabel(item) }}
              </span>
            </template>

            <template #cell-project="{ item }">
              <div class="execution-quote-index__entity-cell">
                <span class="execution-quote-index__entity-icon" aria-hidden="true">
                  <i class="pi pi-briefcase"></i>
                </span>
                <div class="execution-quote-index__primary-cell">
                  <strong>{{ item.project?.title ?? '—' }}</strong>
                  <small v-if="item.project?.date">{{ formatDate(item.project.date) }}</small>
                </div>
              </div>
            </template>

            <template #cell-client="{ item }">
              <div class="execution-quote-index__entity-cell">
                <span
                  class="execution-quote-index__entity-icon execution-quote-index__entity-icon--client"
                  aria-hidden="true"
                >
                  <i class="pi pi-user"></i>
                </span>
                <div class="execution-quote-index__primary-cell">
                  <strong>{{ item.client?.name ?? '—' }}</strong>
                  <small>{{ item.client?.phone ?? '—' }}</small>
                  <span
                    v-if="item.client?.status !== undefined"
                    class="execution-quote-index__client-status"
                    :class="{
                      'execution-quote-index__client-status--active': item.client.status === 1,
                    }"
                  >
                    <span aria-hidden="true"></span>
                    {{ clientStatusLabel(item.client.status) }}
                  </span>
                </div>
              </div>
            </template>

            <template #cell-quoteType="{ item }">
              <span
                class="execution-quote-index__type"
                :class="{
                  'execution-quote-index__type--supervision':
                    item.quoteType?.id === ExecutionQuoteTypeEnum.SUPERVISION,
                }"
              >
                <i
                  :class="
                    item.quoteType?.id === ExecutionQuoteTypeEnum.SUPERVISION
                      ? 'pi pi-eye'
                      : 'pi pi-calculator'
                  "
                  aria-hidden="true"
                ></i>
                {{ quoteTypeLabel(item) }}
              </span>
            </template>

            <template #cell-priceEmployee="{ item }">
              <div
                class="execution-quote-index__entity-cell execution-quote-index__entity-cell--compact"
              >
                <span class="execution-quote-index__owner-icon" aria-hidden="true">
                  <i class="pi pi-user-edit"></i>
                </span>
                <div class="execution-quote-index__primary-cell">
                  <strong>{{ item.priceEmployee?.name ?? '—' }}</strong>
                </div>
              </div>
            </template>

            <template #cell-totalQuotePrice="{ item }">
              <div class="execution-quote-index__amount">
                <strong>{{ formatAmount(item.totalQuotePrice) }}</strong>
                <small v-if="item.totalQuotePrice !== undefined">
                  {{ $t('execution_quote.table.currency_egp') }}
                </small>
              </div>
            </template>

            <template #cell-quoteProgress="{ item }">
              <div class="execution-quote-index__progress">
                <span
                  class="execution-quote-index__progress-status"
                  :class="`execution-quote-index__progress-status--${quoteProgressState(item)}`"
                >
                  <span aria-hidden="true"></span>
                  {{ quoteProgressLabel(item) }}
                </span>
                <span class="execution-quote-index__progress-counts">
                  <span>
                    <i class="pi pi-sitemap" aria-hidden="true"></i>
                    {{ $t('execution_quote.table.stages_count', { count: item.quoteStagesCount }) }}
                  </span>
                  <span>
                    <i class="pi pi-list" aria-hidden="true"></i>
                    {{
                      $t('execution_quote.table.items_count_value', {
                        count: item.quoteItemsCount,
                      })
                    }}
                  </span>
                </span>
              </div>
            </template>

            <template #cell-createdAt="{ item }">
              <time class="execution-quote-index__date" :datetime="item.createdAt">
                <i class="pi pi-calendar" aria-hidden="true"></i>
                {{ formatDate(item.createdAt) }}
              </time>
            </template>

            <template #actions="{ item }">
              <div class="execution-quote-index__row-actions">
                <template v-if="canModifyQuote(item)">
                  <AppButton
                    class="execution-quote-index__add-item-button"
                    size="sm"
                    icon="right"
                    @click="openAddItem(item)"
                  >
                    <template #icon>
                      <i class="pi pi-list" aria-hidden="true"></i>
                    </template>
                    {{ $t('execution_quote.table.add_item') }}
                  </AppButton>

                  <AppButton
                    class="execution-quote-index__add-stage-button"
                    size="sm"
                    theme="secondary"
                    icon="right"
                    outline
                    @click="openAddStage(item)"
                  >
                    <template #icon>
                      <i class="pi pi-sitemap" aria-hidden="true"></i>
                    </template>
                    {{ $t('execution_quote.table.add_stage') }}
                  </AppButton>
                </template>

                <QuoteStatusBadge :status="item.quoteStatus" />

                <AppButton
                  class="execution-quote-index__view-button"
                  size="sm"
                  theme="secondary"
                  icon="right"
                  ghost
                  @click="openShow(item)"
                >
                  <template #icon>
                    <i class="pi pi-eye" aria-hidden="true"></i>
                  </template>
                  {{ $t('execution_quote.show.action') }}
                </AppButton>
              </div>
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

<style lang="scss" src="./execution-quote-pilot.scss"></style>
