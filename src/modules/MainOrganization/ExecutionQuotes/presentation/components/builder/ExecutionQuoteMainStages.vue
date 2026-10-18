<script setup lang="ts">
import type StageModel from '@/modules/shared/Stages/core/models/stage.model';
import type { ExecutionQuoteStageState } from '../../types/execution.quote.ui.types';

withDefaults(
  defineProps<{
    stages: StageModel[];
    stageStates: Record<string, ExecutionQuoteStageState>;
    loading?: boolean;
    showPricing?: boolean;
  }>(),
  { loading: false, showPricing: true },
);

const emit = defineEmits<{
  (event: 'open', stage: StageModel): void;
}>();

const childrenCount = (stage: StageModel) => {
  const value = (stage as StageModel & { stageChildrenCount?: number }).stageChildrenCount;
  return typeof value === 'number' ? value : 0;
};
</script>

<template>
  <section class="execution-builder-card">
    <div class="builder-section-title">
      <div class="builder-section-title__group">
        <span class="builder-badge">{{ stages.length }}</span>
        <h2>{{ $t('execution_quote.main_stages_title') }}</h2>
      </div>
      <span class="builder-hint">{{ $t('execution_quote.main_stages_hint') }}</span>
    </div>

    <div v-if="loading" class="builder-empty">{{ $t('loading_data') }}</div>
    <div v-else-if="!stages.length" class="builder-empty">
      {{ $t('execution_quote.main_stages_empty') }}
    </div>

    <div v-else class="stage-grid">
      <button
        v-for="stage in stages"
        :key="stage.id"
        type="button"
        class="stage-card"
        @click="emit('open', stage)"
      >
        <span class="stage-card__topline">
          <span class="stage-card__status" :class="{ 'stage-card__status--active': stage.status }">
            {{ stage.status ? $t('active') : $t('inactive') }}
          </span>
          <span class="stage-card__children">
            {{ childrenCount(stage) }}
          </span>
        </span>

        <strong>{{ stage.title }}</strong>

        <small>
          {{
            $t('execution_quote.stage_items_count', {
              count: stageStates[String(stage.id)]?.items.length ?? 0,
            })
          }}
        </small>

        <span v-if="showPricing" class="stage-card__footer">
          <span>{{ $t('execution_quote.client_stage_price') }}</span>
          <b>
            {{ stageStates[String(stage.id)]?.client_price ?? $t('execution_quote.not_started') }}
          </b>
        </span>

        <span v-else class="stage-card__footer stage-card__footer--informative">
          <i class="pi pi-info-circle" aria-hidden="true"></i>
          <span>{{ $t('execution_quote.pricing_not_required_short') }}</span>
        </span>
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
  box-shadow: none;
}

.builder-section-title,
.builder-section-title__group,
.stage-card__topline,
.stage-card__footer {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.builder-section-title {
  justify-content: space-between;
}

.builder-section-title h2 {
  margin: 0;
  color: var(--title-card-color);
  font-size: 1.15rem;
}

.builder-badge,
.stage-card__status,
.stage-card__children {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  border-radius: var(--radius-full);
  font-size: var(--xs-size);
  font-weight: 700;
  padding: 0.25rem 0.55rem;
}

.builder-badge {
  background: var(--PrimaryColor-light);
  color: var(--PrimaryColor);
}

.builder-hint,
.builder-empty,
.stage-card small,
.stage-card__footer span {
  color: var(--subtitle-color);
  font-size: var(--xs-size);
}

.builder-empty {
  margin-top: 0.85rem;
  padding: 1.2rem;
  border: 1px dashed var(--border-weak);
  border-radius: var(--radius-sm);
  text-align: center;
}

.stage-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  gap: 0.75rem;
  margin-top: 0.85rem;
}

.stage-card {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  min-height: 10rem;
  padding: 0.9rem;
  border: 1px solid var(--border-weak);
  border-radius: var(--radius-md);
  background: var(--bg-card);
  color: var(--title-card-color);
  cursor: pointer;
  text-align: start;
  transition: var(--transition-fast);
}

.stage-card:hover {
  border-color: var(--PrimaryColor);
  box-shadow: none;
  transform: translateY(-1px);
}

.stage-card__topline,
.stage-card__footer {
  justify-content: space-between;
}

.stage-card__status,
.stage-card__children {
  background: var(--gray-100);
  color: var(--gray-600);
}

.stage-card__status--active {
  background: var(--light-green-bg);
  color: var(--primary-green);
}

.stage-card__footer {
  margin-top: auto;
  padding-top: 0.6rem;
  border-top: 1px solid var(--border-weak);
}

.stage-card__footer b {
  color: var(--PrimaryColor);
}

.stage-card__footer--informative {
  justify-content: flex-start;
  color: var(--PrimaryColor);
}

@media (max-width: 640px) {
  .builder-section-title {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
