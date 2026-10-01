<script setup lang="ts">
  import { computed } from 'vue';

  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import AppTable, { type TableHeader } from '@/shared/HelpersComponents/AppTable.vue';

  import { getExecutionQuoteItemSourceTitleKey } from '../../../core/constants/execution.quote.item.source.enum';
  import type { ExecutionQuoteItemState } from '../../types/execution.quote.ui.types';

  const props = withDefaults(
    defineProps<{
      items: ExecutionQuoteItemState[];
      showPricing?: boolean;
    }>(),
    { showPricing: true },
  );

  const emit = defineEmits<{
    (event: 'edit', item: ExecutionQuoteItemState): void;
    (event: 'remove', item: ExecutionQuoteItemState): void;
  }>();

  const detailHeaders: TableHeader[] = [
    { key: 'stage_name', label: 'execution_quote.table.main_stage' },
    { key: 'sub_stage_name', label: 'execution_quote.table.sub_stage' },
    { key: 'source_type', label: 'execution_quote.table.source' },
    { key: 'source_title', label: 'execution_quote.table.item' },
    { key: 'quantity', label: 'execution_quote.table.quantity' },
    { key: 'unit_name', label: 'execution_quote.table.unit' },
  ];

  const actionHeader: TableHeader = {
    key: 'action',
    label: 'execution_quote.table.action',
  };

  const headers = computed<TableHeader[]>(() => {
    if (!props.showPricing) return [...detailHeaders, actionHeader];

    return [
      ...detailHeaders,
      { key: 'unit_price', label: 'execution_quote.table.unit_price' },
      { key: 'total', label: 'execution_quote.table.total' },
      actionHeader,
    ];
  });
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
        appearance="custom"
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
          <div v-if="!item.persisted" class="quote-item-actions">
            <AppButton
              class="quote-item-actions__edit"
              theme="secondary"
              size="sm"
              outline
              icon="right"
              @click.stop="emit('edit', item)"
            >
              <template #icon>
                <i class="pi pi-pencil" aria-hidden="true"></i>
              </template>
              {{ $t('edit') }}
            </AppButton>

            <AppButton
              class="quote-item-actions__delete"
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
          </div>
          <span v-else>—</span>
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

  .quote-item-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    white-space: nowrap;
  }
</style>
