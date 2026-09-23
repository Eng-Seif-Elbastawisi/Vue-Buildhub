<script setup lang="ts">
  import { computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';

  import IndexParams from '@/base/Core/Params/indexParams';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import AppTable, { type TableHeader } from '@/shared/HelpersComponents/AppTable.vue';
  import { QuoteSourceEnum } from '../../core/constants/quote.source.enum';
  import type ExecutionQuoteModel from '../../core/models/execution.quote.model';
  import ExecutionQuoteController from '../controllers/execution.quote.controller';

  const controller = ExecutionQuoteController.getInstance();
  const router = useRouter();
  const state = computed(() => controller.listState.value);

  onMounted(() => {
    void controller.fetchList(new IndexParams('', 1, 20, 1));
  });

  const openAdd = () => {
    void router.push({ name: 'Add Execution Quote' });
  };

  const relationTitle = (relation: { title?: string; name?: string } | number | undefined) =>
    typeof relation === 'object' && relation !== null
      ? (relation.title ?? relation.name ?? '—')
      : (relation ?? '—');

  const headers: TableHeader[] = [
    { key: 'id', label: 'execution_quote.table.id' },
    { key: 'quoteSource', label: 'execution_quote.table.source' },
    { key: 'client', label: 'execution_quote.table.client' },
    { key: 'project', label: 'execution_quote.table.project' },
  ];

  const quoteSourceTitleKey = (source: QuoteSourceEnum | undefined) => {
    if (source === QuoteSourceEnum.EXECUTION_ONLY) {
      return 'execution_quote.sources.execution_only.title';
    }

    if (source === QuoteSourceEnum.EXECUTION_FROM_DESIGN_QUOTE) {
      return 'execution_quote.sources.design_quote.title';
    }

    return '';
  };

  const asExecutionQuotes = (quotes: unknown): ExecutionQuoteModel[] =>
    Array.isArray(quotes) ? (quotes as ExecutionQuoteModel[]) : [];
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
        >
          <template #cell-quoteSource="{ item }">
            {{
              quoteSourceTitleKey(item.quoteSource)
                ? $t(quoteSourceTitleKey(item.quoteSource))
                : '—'
            }}
          </template>

          <template #cell-client="{ item }">
            {{ relationTitle(item.client) }}
          </template>

          <template #cell-project="{ item }">
            {{ relationTitle(item.project) }}
          </template>
        </AppTable>
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

  @media (max-width: 640px) {
    .execution-quote-index__header {
      align-items: flex-start;
      flex-direction: column;
    }
  }
</style>
