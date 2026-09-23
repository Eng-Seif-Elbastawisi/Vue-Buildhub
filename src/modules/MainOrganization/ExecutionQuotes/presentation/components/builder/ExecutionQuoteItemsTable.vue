<script setup lang="ts">
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import AppTable, { type TableHeader } from '@/shared/HelpersComponents/AppTable.vue';

  import { getExecutionQuoteItemSourceTitleKey } from '../../../core/constants/execution.quote.item.source.enum';
  import type { ExecutionQuoteItemState } from '../../types/execution.quote.ui.types';

  defineProps<{
    items: ExecutionQuoteItemState[];
  }>();

  const emit = defineEmits<{
    (event: 'remove', item: ExecutionQuoteItemState): void;
  }>();

  const headers: TableHeader[] = [
    { key: 'stage_name', label: 'execution_quote.table.main_stage' },
    { key: 'sub_stage_name', label: 'execution_quote.table.sub_stage' },
    { key: 'source_type', label: 'execution_quote.table.source' },
    { key: 'source_title', label: 'execution_quote.table.item' },
    { key: 'quantity', label: 'execution_quote.table.quantity' },
    { key: 'unit_name', label: 'execution_quote.table.unit' },
    { key: 'unit_price', label: 'execution_quote.table.unit_price' },
    { key: 'total', label: 'execution_quote.table.total' },
    { key: 'action', label: 'execution_quote.table.action' },
  ];
</script>

<template>
  <section class="execution-builder-card">
    <div class="builder-section-title">
      <h2>{{ $t('execution_quote.quote_items_title') }}</h2>
      <span class="builder-badge">{{ items.length }}</span>
    </div>

    <div class="quote-items-table-wrap">
      <AppTable
        :headers="headers"
        :items="items"
        row-key="id"
        striped
        hoverable
        empty-message="execution_quote.quote_items_empty"
      >
        <template #cell-stage_name="{ item }">
          {{ item.stage_name || '—' }}
        </template>

        <template #cell-sub_stage_name="{ item }">
          {{ item.sub_stage_name || '—' }}
        </template>

        <template #cell-source_type="{ item }">
          {{ $t(getExecutionQuoteItemSourceTitleKey(item.source_type)) }}
        </template>

        <template #cell-source_title="{ item }">
          {{ item.source_title || item.source_id }}
        </template>

        <template #cell-unit_name="{ item }">
          {{ item.unit_name || '—' }}
        </template>

        <template #cell-total="{ item }">
          {{ item.quantity * item.unit_price }}
        </template>

        <template #cell-action="{ item }">
          <AppButton
            theme="danger"
            size="sm"
            outline
            icon="right"
            @click.stop="emit('remove', item)"
          >
            <template #icon>
              <i class="pi pi-trash" aria-hidden="true"></i>
            </template>
            {{ $t('execution_quote.delete_item') }}
          </AppButton>
        </template>
      </AppTable>
    </div>
  </section>
</template>

<style scoped lang="scss">
  .execution-builder-card {
    padding: 1.1rem;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-md);
    background: var(--bg-card);
    box-shadow: var(--shadow-sm);
  }

  .builder-section-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  }

  .builder-section-title h2 {
    margin: 0;
    color: var(--title-card-color);
    font-size: 1.15rem;
  }

  .builder-badge {
    display: inline-flex;
    width: fit-content;
    padding: 0.25rem 0.55rem;
    border-radius: var(--radius-full);
    background: var(--PrimaryColor-light);
    color: var(--PrimaryColor);
    font-size: var(--xs-size);
    font-weight: 700;
  }

  .quote-items-table-wrap {
    margin-top: 0.85rem;
    overflow-x: auto;
  }
</style>
