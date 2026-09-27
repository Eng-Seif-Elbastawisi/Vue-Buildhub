<script setup lang="ts">
  import {
    ExecutionQuoteTypeEnum,
    getExecutionQuoteTypeDescriptionKey,
    getExecutionQuoteTypeTitleKey,
    type ExecutionQuoteType,
  } from '../../../core/constants/execution.quote.type.enum';

  withDefaults(
    defineProps<{
      modelValue: ExecutionQuoteType | null;
      loading?: boolean;
      disabled?: boolean;
    }>(),
    { loading: false, disabled: false },
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
      <div class="builder-section-title__copy">
        <span class="builder-section-title__number" aria-hidden="true">03</span>
        <div>
          <h2>{{ $t('execution_quote.quote_type_title') }}</h2>
          <p>{{ $t('execution_quote.quote_type_hint') }}</p>
        </div>
      </div>
      <i class="builder-section-title__decor pi pi-th-large" aria-hidden="true"></i>
    </div>

    <div class="quote-type-options">
      <button
        v-for="type in quoteTypes"
        :key="type"
        type="button"
        class="quote-type-option"
        :class="{ 'quote-type-option--selected': modelValue === type }"
        :aria-pressed="modelValue === type"
        :aria-describedby="`quote-type-description-${type}`"
        :disabled="loading || disabled"
        @click="emit('update:modelValue', type)"
      >
        <span class="quote-type-option__mark" aria-hidden="true">
          <i
            class="pi"
            :class="type === ExecutionQuoteTypeEnum.LUMP_SUM ? 'pi-calculator' : 'pi-compass'"
          ></i>
        </span>
        <span class="quote-type-option__copy">
          <strong>{{ $t(getExecutionQuoteTypeTitleKey(type)) }}</strong>
          <small :id="`quote-type-description-${type}`">
            {{ $t(getExecutionQuoteTypeDescriptionKey(type)) }}
          </small>
        </span>
        <span class="quote-type-option__check" aria-hidden="true">
          <i class="pi pi-check"></i>
        </span>
      </button>
    </div>
  </section>
</template>

<style scoped lang="scss">
  .execution-builder-card {
    position: relative;
    padding: clamp(1rem, 2vw, 1.5rem);
    overflow: hidden;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-lg);
    background: var(--bg-card);
    box-shadow: var(--shadow-sm);
  }

  .execution-builder-card::before {
    position: absolute;
    inset-block: 1.25rem;
    inset-inline-start: 0;
    width: 0.25rem;
    border-start-end-radius: var(--radius-full);
    border-end-end-radius: var(--radius-full);
    background: var(--PrimaryColor-alpha-30);
    content: '';
  }

  .builder-section-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  }

  .builder-section-title__copy {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 0.8rem;
  }

  .builder-section-title__number {
    display: grid;
    width: 2.55rem;
    height: 2.55rem;
    flex: 0 0 auto;
    place-items: center;
    border: 1px solid var(--PrimaryColor-alpha-30);
    border-radius: 0.8rem 0.8rem 0.25rem;
    background: var(--btn-easy);
    color: var(--PrimaryColor);
    font-size: 0.78rem;
    font-weight: 900;
  }

  .builder-section-title h2 {
    margin: 0;
    color: var(--title-card-color);
    font-size: 1.12rem;
  }

  .builder-section-title p {
    margin: 0.2rem 0 0;
    color: var(--subtitle-color);
    font-size: 0.78rem;
    font-weight: 600;
  }

  .builder-section-title__decor {
    color: var(--gray-300);
    font-size: 1.65rem;
  }

  .quote-type-options {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.8rem;
    margin-top: 1.25rem;
  }

  .quote-type-option {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 0.9rem;
    min-height: 6rem;
    padding: 1rem 1.1rem;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-md);
    background: var(--bg-section);
    color: var(--title-card-color);
    cursor: pointer;
    text-align: start;
    transition: var(--transition-fast);
  }

  .quote-type-option:hover:not(:disabled) {
    border-color: var(--PrimaryColor-alpha-50);
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  .quote-type-option:focus-visible {
    border-color: var(--PrimaryColor);
    outline: 3px solid var(--PrimaryColor-alpha-20);
    outline-offset: 2px;
  }

  .quote-type-option:disabled {
    cursor: not-allowed;
  }

  .quote-type-option--selected {
    border-color: var(--PrimaryColor);
    background: var(--btn-easy);
    box-shadow: inset 0 -3px 0 var(--PrimaryColor);
  }

  .quote-type-option__mark {
    display: grid;
    place-items: center;
    width: 2.8rem;
    height: 2.8rem;
    border: 1px solid var(--border-weak);
    border-radius: 0.85rem 0.85rem 0.3rem;
    background: var(--bg-card);
    color: var(--PrimaryColor);
    font-weight: 800;
  }

  .quote-type-option--selected .quote-type-option__mark {
    background: var(--PrimaryColor);
    color: var(--white);
  }

  .quote-type-option__copy {
    min-width: 0;
  }

  .quote-type-option__copy strong,
  .quote-type-option__copy small {
    display: block;
  }

  .quote-type-option__copy small {
    margin-top: 0.25rem;
    color: var(--subtitle-color);
    font-size: 0.78rem;
    font-weight: 600;
    line-height: 1.5;
  }

  .quote-type-option__check {
    display: grid;
    width: 1.65rem;
    height: 1.65rem;
    place-items: center;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-full);
    color: transparent;
    font-size: 0.65rem;
    transition: var(--transition-fast);
  }

  .quote-type-option--selected .quote-type-option__check {
    border-color: var(--PrimaryColor);
    background: var(--PrimaryColor);
    color: var(--white);
  }

  @media (max-width: 640px) {
    .quote-type-options {
      grid-template-columns: 1fr;
    }

    .builder-section-title__decor {
      display: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .quote-type-option,
    .quote-type-option__check {
      transition: none;
    }

    .quote-type-option:hover:not(:disabled) {
      transform: none;
    }
  }
</style>
