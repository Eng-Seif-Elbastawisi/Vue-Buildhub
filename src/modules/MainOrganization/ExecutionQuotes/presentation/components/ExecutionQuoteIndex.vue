<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useRouter } from 'vue-router';

  import IndexParams from '@/base/Core/Params/indexParams';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import AppTable, { type TableHeader } from '@/shared/HelpersComponents/AppTable.vue';
  import Pagination from '@/shared/HelpersComponents/Pagination.vue';
  import {
    ExecutionQuoteTypeEnum,
    getExecutionQuoteTypeTitleKey,
    type ExecutionQuoteType,
  } from '../../core/constants/execution.quote.type.enum';
  import { getQuoteSourceTitleKey } from '../../core/constants/quote.source.enum';
  import type ExecutionQuoteShowModel from '../../core/models/execution.quote.show.model';
  import ExecutionQuoteController from '../controllers/execution.quote.controller';

  const controller = ExecutionQuoteController.getInstance();
  const router = useRouter();
  const { locale, t } = useI18n();
  const state = computed(() => controller.listState.value);
  const perPage = ref(20);

  const fetchQuotes = async (page: number = 1) => {
    await controller.fetchList(new IndexParams('', page, perPage.value, 1));
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
    { key: 'id', label: 'execution_quote.table.id' },
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

    <DataStatusBuilder :controller="state">
      <template #success="{ data: quotes }">
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
              <small>#{{ item.project?.id ?? '—' }}</small>
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
              <small>#{{ item.priceEmployee?.id ?? '—' }}</small>
            </div>
          </template>

          <template #cell-quoteProgress="{ item }">
            <div class="execution-quote-index__progress">
              <strong>
                {{ $t('execution_quote.table.stages_count', { count: item.quoteStagesCount }) }}
              </strong>
              <small>
                {{ $t('execution_quote.table.items_count_value', { count: item.quoteItemsCount }) }}
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
  }

  .execution-quote-index__header h1,
  .execution-quote-index__header p {
    margin: 0;
  }

  .execution-quote-index__header p {
    color: var(--subtitle-color);
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

  @media (max-width: 640px) {
    .execution-quote-index__header {
      align-items: flex-start;
      flex-direction: column;
    }
  }
</style>
