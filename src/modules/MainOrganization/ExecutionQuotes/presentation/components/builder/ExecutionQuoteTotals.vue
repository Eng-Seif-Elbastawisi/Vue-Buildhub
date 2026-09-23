<script setup lang="ts">
  withDefaults(
    defineProps<{
      internalCost: number;
      itemsCount: number;
      clientTotal: number;
      expectedMargin: number;
      currentStageCost?: number;
      currentStageMargin?: number;
      showCurrentStage?: boolean;
    }>(),
    {
      currentStageCost: 0,
      currentStageMargin: 0,
      showCurrentStage: false,
    },
  );
</script>

<template>
  <section class="execution-builder-card totals-grid">
    <article>
      <span>{{ $t('execution_quote.internal_cost') }}</span>
      <strong>{{ internalCost }}</strong>
    </article>
    <article>
      <span>{{ $t('execution_quote.items') }}</span>
      <strong>{{ itemsCount }}</strong>
    </article>
    <article>
      <span>{{ $t('execution_quote.client_total') }}</span>
      <strong>{{ clientTotal }}</strong>
    </article>
    <article>
      <span>{{ $t('execution_quote.expected_margin') }}</span>
      <strong>{{ expectedMargin }}</strong>
    </article>

    <small v-if="showCurrentStage">
      {{
        $t('execution_quote.current_stage_summary', {
          cost: currentStageCost,
          margin: currentStageMargin,
        })
      }}
    </small>
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

  .totals-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.75rem;
  }

  .totals-grid article {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    padding: 0.85rem;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-sm);
    background: var(--bg-card);
  }

  .totals-grid article span,
  .totals-grid small {
    color: var(--subtitle-color);
    font-size: var(--xs-size);
  }

  .totals-grid article strong {
    color: var(--title-card-color);
    font-size: 1.1rem;
  }

  .totals-grid small {
    grid-column: 1 / -1;
  }

  @media (max-width: 800px) {
    .totals-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 520px) {
    .totals-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
