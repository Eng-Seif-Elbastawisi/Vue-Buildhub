<script setup lang="ts">
  import {
    ExecutionQuoteItemSourceEnum,
    getExecutionQuoteItemSourceTitleKey,
    type ExecutionQuoteItemSource,
  } from '../../../core/constants/execution.quote.item.source.enum';

  const props = withDefaults(
    defineProps<{
      modelValue: ExecutionQuoteItemSource | null;
      disabled?: boolean;
      pricingEnabled?: boolean;
    }>(),
    { disabled: false, pricingEnabled: true },
  );

  const emit = defineEmits<{
    (event: 'update:modelValue', value: ExecutionQuoteItemSource): void;
  }>();

  const cards: Array<{
    value: ExecutionQuoteItemSource;
    code: string;
    descriptionKey: string;
  }> = [
    {
      value: ExecutionQuoteItemSourceEnum.PRODUCT,
      code: 'PRODUCT',
      descriptionKey: 'execution_quote.item_sources.product.description',
    },
    {
      value: ExecutionQuoteItemSourceEnum.BUILDING_MATERIAL,
      code: 'MAT',
      descriptionKey: 'execution_quote.item_sources.building_material.description',
    },
    {
      value: ExecutionQuoteItemSourceEnum.LABOR,
      code: 'LABOR',
      descriptionKey: 'execution_quote.item_sources.labor.description',
    },
  ];

  const descriptionKey = (key: string) =>
    props.pricingEnabled ? key : `${key}_without_pricing`;
</script>

<template>
  <section class="execution-builder-card">
    <div class="builder-section-title">
      <h2>{{ $t('execution_quote.what_will_you_add') }}</h2>
      <span v-if="modelValue" class="builder-badge">
        {{ $t(getExecutionQuoteItemSourceTitleKey(modelValue)) }}
      </span>
    </div>

    <div class="source-grid">
      <button
        v-for="card in cards"
        :key="card.value"
        type="button"
        class="source-card"
        :class="{ 'source-card--selected': modelValue === card.value }"
        :aria-pressed="modelValue === card.value"
        :disabled="disabled"
        @click="emit('update:modelValue', card.value)"
      >
        <span class="source-card__code">{{ card.code }}</span>
        <strong>{{ $t(getExecutionQuoteItemSourceTitleKey(card.value)) }}</strong>
        <small>{{ $t(descriptionKey(card.descriptionKey)) }}</small>
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

.builder-badge,
.source-card__code {
  display: inline-flex;
  width: fit-content;
  padding: 0.25rem 0.55rem;
  border-radius: var(--radius-full);
  font-size: var(--xs-size);
  font-weight: 700;
}

.builder-badge {
  background: var(--PrimaryColor-light);
  color: var(--PrimaryColor);
}

.source-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
  margin-top: 0.85rem;
}

.source-card {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-height: 7rem;
  padding: 0.9rem;
  border: 1px solid var(--border-weak);
  border-radius: var(--radius-md);
  background: var(--bg-card);
  color: var(--title-card-color);
  cursor: pointer;
  text-align: start;
  transition: var(--transition-fast);
}

.source-card:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.source-card--selected {
  border-color: var(--PrimaryColor);
  background: var(--PrimaryColor-alpha-4);
  box-shadow: none;
}

.source-card__code {
  align-self: flex-end;
  background: var(--gray-100);
  color: var(--gray-600);
}

.source-card small {
  color: var(--subtitle-color);
  font-size: var(--xs-size);
}

@media (max-width: 800px) {
  .source-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 520px) {
  .source-grid {
    grid-template-columns: 1fr;
  }
}
</style>
