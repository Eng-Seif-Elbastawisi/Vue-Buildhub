<script setup lang="ts">
  import { computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';

  import IndexParams from '@/base/Core/Params/indexParams';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
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
</script>

<template>
  <section class="execution-quote-index">
    <div class="execution-quote-index__header">
      <div>
        <h1>{{ $t('execution_quote.title') }}</h1>
        <p>{{ $t('execution_quote.index_description') }}</p>
      </div>
      <button class="btn btn-primary" type="button" @click="openAdd">
        {{ $t('execution_quote.new_quote') }}
      </button>
    </div>

    <DataStatusBuilder :controller="state">
      <template #success="{ data: quotes }">
        <div class="execution-quote-index__table-wrap">
          <table class="execution-quote-index__table">
            <thead>
              <tr>
                <th>{{ $t('execution_quote.table.id') }}</th>
                <th>{{ $t('execution_quote.table.source') }}</th>
                <th>{{ $t('execution_quote.table.client') }}</th>
                <th>{{ $t('execution_quote.table.project') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="quote in quotes" :key="quote.id">
                <td>{{ quote.id ?? '—' }}</td>
                <td>{{ quote.quoteSource ?? '—' }}</td>
                <td>{{ quote.client_title ?? '—' }}</td>
                <td>{{ quote.project_totle ?? '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
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

  .execution-quote-index__table-wrap {
    overflow-x: auto;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-md);
    background: var(--bg-card);
  }

  .execution-quote-index__table {
    width: 100%;
    border-collapse: collapse;
  }

  .execution-quote-index__table th,
  .execution-quote-index__table td {
    border-bottom: 1px solid var(--border-weak);
    padding: 0.8rem 1rem;
    text-align: start;
  }

  .execution-quote-index__table th {
    background: var(--bg-section);
    color: var(--title-card-color);
  }

  @media (max-width: 640px) {
    .execution-quote-index__header {
      align-items: flex-start;
      flex-direction: column;
    }
  }
</style>
