<script setup lang="ts">
  import type StageModel from '@/modules/shared/Stages/core/models/stage.model';
  import type { ExecutionQuoteItemState } from '../../types/execution.quote.ui.types';

  withDefaults(
    defineProps<{
      stages: StageModel[];
      modelValue?: number | string;
      items: ExecutionQuoteItemState[];
      loading?: boolean;
    }>(),
    { loading: false, modelValue: undefined },
  );

  const emit = defineEmits<{
    (event: 'update:modelValue', value: number | string): void;
  }>();
</script>

<template>
  <section class="execution-builder-card">
    <div class="builder-section-title">
      <h2>{{ $t('execution_quote.select_sub_stage') }}</h2>
      <span class="builder-badge">{{ stages.length }}</span>
    </div>

    <div v-if="loading" class="builder-empty">{{ $t('loading_data') }}</div>
    <div v-else-if="!stages.length" class="builder-empty">
      {{ $t('execution_quote.sub_stages_empty') }}
    </div>

    <div v-else class="sub-stage-grid">
      <button
        v-for="stage in stages"
        :key="stage.id"
        type="button"
        class="sub-stage-card"
        :class="{ 'sub-stage-card--selected': modelValue === stage.id }"
        :aria-pressed="modelValue === stage.id"
        @click="stage.id && emit('update:modelValue', stage.id)"
      >
        <strong>{{ stage.title }}</strong>
        <small>
          {{
            $t('execution_quote.stage_items_count', {
              count: items.filter((item) => item.sub_stage_id === stage.id).length,
            })
          }}
        </small>
      </button>
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

  .builder-empty {
    margin-top: 0.85rem;
    padding: 1.2rem;
    border: 1px dashed var(--border-weak);
    border-radius: var(--radius-sm);
    color: var(--subtitle-color);
    font-size: var(--xs-size);
    text-align: center;
  }

  .sub-stage-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.75rem;
    margin-top: 0.85rem;
  }

  .sub-stage-card {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    min-height: 5rem;
    padding: 0.9rem;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-md);
    background: var(--bg-card);
    color: var(--title-card-color);
    cursor: pointer;
    text-align: start;
    transition: var(--transition-fast);
  }

  .sub-stage-card small {
    color: var(--subtitle-color);
    font-size: var(--xs-size);
  }

  .sub-stage-card--selected {
    border-color: var(--PrimaryColor);
    background: var(--PrimaryColor-alpha-4);
    box-shadow: inset 0 -3px 0 var(--PrimaryColor);
  }

  @media (max-width: 800px) {
    .sub-stage-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 520px) {
    .sub-stage-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
