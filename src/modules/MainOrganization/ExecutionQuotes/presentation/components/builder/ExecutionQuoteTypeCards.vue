<script setup lang="ts">
  import {
    ExecutionQuoteTypeEnum,
    getExecutionQuoteTypeTitleKey,
    type ExecutionQuoteType,
  } from '../../../core/constants/execution.quote.type.enum';

  withDefaults(
    defineProps<{
      modelValue: ExecutionQuoteType | null;
      loading?: boolean;
    }>(),
    { loading: false },
  );

  const emit = defineEmits<{
    (event: 'update:modelValue', value: ExecutionQuoteType): void;
  }>();

  const quoteTypes: ExecutionQuoteType[] = [
    ExecutionQuoteTypeEnum.LUMP_SUM,
    ExecutionQuoteTypeEnum.SUPERVISION,
  ];
</script>

<template>
  <section class="execution-builder-card">
    <div class="builder-section-title">
      <h2>{{ $t('execution_quote.quote_type_title') }}</h2>
    </div>

    <div class="quote-type-options">
      <button
        v-for="type in quoteTypes"
        :key="type"
        type="button"
        class="quote-type-option"
        :class="{ 'quote-type-option--selected': modelValue === type }"
        :aria-pressed="modelValue === type"
        :disabled="loading"
        @click="emit('update:modelValue', type)"
      >
        <span class="quote-type-option__mark" aria-hidden="true">
          {{ type === ExecutionQuoteTypeEnum.LUMP_SUM ? '✓' : '◎' }}
        </span>
        <span>
          <strong>{{ $t(getExecutionQuoteTypeTitleKey(type)) }}</strong>
          <small>{{ $t(`execution_quote.quote_types.${type}.description`) }}</small>
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

  .quote-type-options {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
    margin-top: 0.85rem;
  }

  .quote-type-option {
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    gap: 0.75rem;
    min-height: 5.25rem;
    padding: 0.85rem;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-md);
    background: var(--bg-card);
    color: var(--title-card-color);
    cursor: pointer;
    text-align: start;
    transition: var(--transition-fast);
  }

  .quote-type-option:hover {
    border-color: var(--PrimaryColor-alpha-30);
    box-shadow: var(--shadow-sm);
  }

  .quote-type-option--selected {
    border-color: var(--primary-green);
    background: var(--light-green-bg);
    box-shadow: inset 0 -3px 0 var(--primary-green);
  }

  .quote-type-option__mark {
    display: grid;
    place-items: center;
    width: 2.2rem;
    height: 2.2rem;
    border-radius: var(--radius-full);
    background: var(--gray-100);
    color: var(--gray-600);
    font-weight: 800;
  }

  .quote-type-option--selected .quote-type-option__mark {
    background: var(--primary-green);
    color: var(--white);
  }

  .quote-type-option strong,
  .quote-type-option small {
    display: block;
  }

  .quote-type-option small {
    margin-top: 0.2rem;
    color: var(--subtitle-color);
    font-size: var(--xs-size);
  }

  @media (max-width: 640px) {
    .quote-type-options {
      grid-template-columns: 1fr;
    }
  }
</style>
