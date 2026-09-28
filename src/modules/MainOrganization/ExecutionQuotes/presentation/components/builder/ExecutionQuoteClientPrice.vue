<script setup lang="ts">
  import { computed } from 'vue';

  import {
    ExecutionQuoteTypeEnum,
    type ExecutionQuoteType,
  } from '../../../core/constants/execution.quote.type.enum';
  import {
    EXECUTION_QUOTE_STAGE_PERCENTAGE_MAXIMUM,
    EXECUTION_QUOTE_STAGE_PRICING_MINIMUM,
  } from '../../../core/params/set.execution.quote.stage.pricing.params';

  const props = withDefaults(
    defineProps<{
      modelValue: number | null;
      quoteType: ExecutionQuoteType;
      disabled?: boolean;
    }>(),
    { disabled: false },
  );

  const emit = defineEmits<{
    (event: 'update:modelValue', value: number | null): void;
  }>();

  const isSupervision = computed(() => props.quoteType === ExecutionQuoteTypeEnum.SUPERVISION);
  const titleKey = computed(() =>
    isSupervision.value
      ? 'execution_quote.stage_pricing.percentage_title'
      : 'execution_quote.client_stage_price',
  );
  const placeholderKey = computed(() =>
    isSupervision.value
      ? 'execution_quote.stage_pricing.percentage_placeholder'
      : 'execution_quote.placeholders.client_stage_price',
  );
  const badgeKey = computed(() =>
    isSupervision.value
      ? 'execution_quote.stage_pricing.percentage_badge'
      : 'execution_quote.stage_pricing.price_badge',
  );

  const onInput = (event: Event) => {
    const raw = (event.target as HTMLInputElement).value;
    if (raw === '') {
      emit('update:modelValue', null);
      return;
    }

    const numericValue = Number(raw);
    if (!Number.isFinite(numericValue)) {
      emit('update:modelValue', props.modelValue);
      return;
    }

    const minimumValue = Math.max(numericValue, EXECUTION_QUOTE_STAGE_PRICING_MINIMUM);
    emit(
      'update:modelValue',
      isSupervision.value
        ? Math.min(minimumValue, EXECUTION_QUOTE_STAGE_PERCENTAGE_MAXIMUM)
        : minimumValue,
    );
  };
</script>

<template>
  <section class="execution-builder-card client-price">
    <div class="builder-section-title">
      <h2>
        {{ $t(titleKey) }}
        <span class="required-indicator" aria-hidden="true">*</span>
      </h2>
      <span class="builder-badge">{{ $t(badgeKey) }}</span>
    </div>

    <div class="pricing-input">
      <input
        :value="modelValue ?? ''"
        type="number"
        :min="EXECUTION_QUOTE_STAGE_PRICING_MINIMUM"
        :max="isSupervision ? EXECUTION_QUOTE_STAGE_PERCENTAGE_MAXIMUM : undefined"
        step="1"
        required
        :disabled="disabled"
        :aria-required="!disabled"
        :aria-label="$t(titleKey)"
        :placeholder="$t(placeholderKey)"
        @input="onInput"
      />
      <span class="pricing-input__suffix">
        {{ isSupervision ? '%' : $t('execution_quote.table.currency_egp') }}
      </span>
    </div>
    <small class="pricing-input__hint">
      {{ $t('execution_quote.stage_pricing.minimum_hint') }}
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

  .required-indicator {
    color: var(--danger);
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

  .pricing-input {
    position: relative;
    margin-top: 0.85rem;
  }

  .pricing-input input {
    width: 100%;
    min-height: 2.8rem;
    padding-block: 0.55rem;
    padding-inline: 0.7rem 3.5rem;
    border: 1px solid var(--input-border-color);
    border-radius: var(--radius-sm);
    background: var(--bg-card);
    color: var(--Title-input-Color);
  }

  .pricing-input input:disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }

  .pricing-input__suffix {
    position: absolute;
    top: 50%;
    inset-inline-end: 0.75rem;
    color: var(--subtitle-color);
    font-size: var(--xs-size);
    font-weight: 700;
    pointer-events: none;
    transform: translateY(-50%);
  }

  .pricing-input__hint {
    display: block;
    margin-block-start: 0.4rem;
    color: var(--subtitle-color);
    font-size: var(--xs-size);
  }
</style>
