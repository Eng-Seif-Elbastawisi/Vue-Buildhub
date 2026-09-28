<script setup lang="ts">
import { EXECUTION_QUOTE_STAGE_PRICING_MINIMUM } from '../../../core/params/set.execution.quote.stage.pricing.params';

const props = withDefaults(
  defineProps<{
    modelValue: number | null;
    disabled?: boolean;
  }>(),
  { disabled: false },
);

const emit = defineEmits<{
  (event: 'update:modelValue', value: number | null): void;
}>();

const onInput = (event: Event) => {
  const raw = (event.target as HTMLInputElement).value;
  if (raw === '') {
    emit('update:modelValue', null);
    return;
  }

  const numericValue = Number(raw);
  emit(
    'update:modelValue',
    Number.isFinite(numericValue)
      ? Math.max(numericValue, EXECUTION_QUOTE_STAGE_PRICING_MINIMUM)
      : props.modelValue,
  );
};
</script>

<template>
  <section class="execution-builder-card client-price">
    <div class="builder-section-title">
      <h2>
        {{ $t('execution_quote.client_stage_price') }}
        <span class="required-indicator" aria-hidden="true">*</span>
      </h2>
      <span class="builder-badge">{{ $t('execution_quote.stage_pricing.price_badge') }}</span>
    </div>

    <div class="pricing-input">
      <input :value="modelValue ?? ''" type="number" :min="EXECUTION_QUOTE_STAGE_PRICING_MINIMUM" step="1" required
        :disabled="disabled" :aria-required="!disabled" :aria-label="$t('execution_quote.client_stage_price')"
        :placeholder="$t('execution_quote.placeholders.client_stage_price')" @input="onInput" />

      <span class="pricing-input__suffix">
        {{ $t('execution_quote.table.currency_egp') }}
      </span>
    </div>
    <small class="pricing-input__hint">
      {{ $t('execution_quote.stage_pricing.price_default_hint') }}
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
