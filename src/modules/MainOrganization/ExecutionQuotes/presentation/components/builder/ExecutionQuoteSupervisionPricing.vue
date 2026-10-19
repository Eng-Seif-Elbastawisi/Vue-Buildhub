<script setup lang="ts">
  import { useI18n } from 'vue-i18n';

  import {
    EXECUTION_QUOTE_STAGE_PERCENTAGE_MAXIMUM,
    EXECUTION_QUOTE_STAGE_PRICING_MINIMUM,
  } from '../../../core/params/set.execution.quote.stage.pricing.params';

  const props = withDefaults(
    defineProps<{
      modelValue: number | null;
      internalCost?: number;
      clientTotal?: number;
      disabled?: boolean;
    }>(),
    {
      internalCost: undefined,
      clientTotal: undefined,
      disabled: false,
    },
  );

  const emit = defineEmits<{
    (event: 'update:modelValue', value: number | null): void;
  }>();

  const { locale } = useI18n();

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat(locale.value, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);

  const formatBackendPrice = (amount: number | undefined) =>
    amount === undefined ? '—' : formatPrice(amount);

  const onInput = (event: Event) => {
    const percentageInput = event.target as HTMLInputElement;
    const raw = percentageInput.value;
    if (raw === '') {
      emit('update:modelValue', null);
      return;
    }

    const numericValue = Number(raw);
    if (!Number.isFinite(numericValue)) {
      emit('update:modelValue', props.modelValue);
      return;
    }

    const normalizedPercentage = Math.min(
      Math.max(numericValue, EXECUTION_QUOTE_STAGE_PRICING_MINIMUM),
      EXECUTION_QUOTE_STAGE_PERCENTAGE_MAXIMUM,
    );
    percentageInput.value = String(normalizedPercentage);
    emit('update:modelValue', normalizedPercentage);
  };
</script>

<template>
  <section
    class="supervision-pricing"
    :class="{ 'supervision-pricing--disabled': disabled }"
    :aria-disabled="disabled"
    aria-labelledby="supervision-pricing-title"
  >
    <div class="supervision-pricing__header">
      <span class="supervision-pricing__icon" aria-hidden="true">
        <i class="pi pi-percentage"></i>
      </span>
      <div>
        <span class="supervision-pricing__badge">
          {{ $t('execution_quote.supervision_pricing.quote_wide_badge') }}
        </span>
        <h2 id="supervision-pricing-title">
          {{ $t('execution_quote.supervision_pricing.title') }}
        </h2>
        <p>{{ $t('execution_quote.supervision_pricing.description') }}</p>
      </div>
    </div>

    <div class="supervision-pricing__content">
      <label class="supervision-pricing__field">
        <span>
          {{ $t('execution_quote.supervision_pricing.percentage_label') }}
          <b aria-hidden="true">*</b>
        </span>
        <span class="supervision-pricing__input-wrap">
          <input
            class="workspace-control"
            :value="modelValue ?? ''"
            type="number"
            :min="EXECUTION_QUOTE_STAGE_PRICING_MINIMUM"
            :max="EXECUTION_QUOTE_STAGE_PERCENTAGE_MAXIMUM"
            step="1"
            required
            :disabled="disabled"
            aria-describedby="supervision-percentage-hint"
            :placeholder="$t('execution_quote.stage_pricing.percentage_placeholder')"
            @input="onInput"
          />
          <strong aria-hidden="true">%</strong>
        </span>
        <small
          id="supervision-percentage-hint"
          :class="{ 'supervision-pricing__disabled-hint': disabled }"
        >
          <i v-if="disabled" class="pi pi-lock" aria-hidden="true"></i>
          {{
            $t(
              disabled
                ? 'execution_quote.supervision_pricing.add_items_to_enable'
                : 'execution_quote.stage_pricing.minimum_hint',
            )
          }}
        </small>
      </label>

      <dl class="supervision-pricing__summary">
        <div>
          <dt>{{ $t('execution_quote.supervision_pricing.internal_total') }}</dt>
          <dd>{{ formatBackendPrice(internalCost) }}</dd>
        </div>
        <div class="supervision-pricing__total">
          <dt>{{ $t('execution_quote.supervision_pricing.client_total') }}</dt>
          <dd>
            {{ formatBackendPrice(clientTotal) }}
            <small>{{ $t('execution_quote.table.currency_egp') }}</small>
          </dd>
        </div>
      </dl>
    </div>
  </section>
</template>

<style scoped lang="scss">
.supervision-pricing {
  overflow: hidden;
  padding: 1.15rem;
  border: 1px solid var(--PrimaryColor-alpha-30);
  border-radius: var(--radius-lg);
  background: var(--bg-card);
  box-shadow: none;
  transition:
    border-color var(--transition-fast),
    background-color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.supervision-pricing--disabled {
  border-color: var(--border-weak);
  background: var(--bg-light);
  box-shadow: none;
}

.supervision-pricing__header,
.supervision-pricing__content,
.supervision-pricing__summary {
  display: flex;
}

.supervision-pricing__header {
  align-items: flex-start;
  gap: 0.8rem;
}

.supervision-pricing__icon {
  display: grid;
  flex: 0 0 2.6rem;
  place-items: center;
  width: 2.6rem;
  height: 2.6rem;
  border-radius: var(--radius-md);
  background: var(--PrimaryColor);
  color: var(--bg-card);
}

.supervision-pricing__badge {
  color: var(--PrimaryColor);
  font-size: var(--xs-size);
  font-weight: 700;
}

.supervision-pricing h2 {
  margin: 0.2rem 0;
  color: var(--title-card-color);
  font-size: 1.2rem;
}

.supervision-pricing p,
.supervision-pricing__field small,
.supervision-pricing dt {
  color: var(--subtitle-color);
  font-size: var(--xs-size);
}

.supervision-pricing p {
  margin: 0;
}

.supervision-pricing__content {
  align-items: stretch;
  gap: 1rem;
  margin-top: 1rem;
}

.supervision-pricing__field {
  display: flex;
  flex: 0 1 22rem;
  flex-direction: column;
  gap: 0.4rem;
  font-weight: 700;
}

.supervision-pricing__field b {
  color: var(--danger);
}

.supervision-pricing__disabled-hint {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: var(--PrimaryColor);
  font-weight: 700;
}

.supervision-pricing__input-wrap {
  position: relative;
}

.supervision-pricing__input-wrap input {
  width: 100%;
  min-height: 3.1rem;
  padding-inline: 0.8rem 2.8rem;
  border: 1px solid var(--input-border-color);
  border-radius: var(--bh-radius-control);
  background: var(--bg-card);
  color: var(--Title-input-Color);
  font: inherit;
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.supervision-pricing__input-wrap input:focus {
  border-color: var(--PrimaryColor);
  outline: none;
  box-shadow: none;
}

.supervision-pricing__input-wrap strong {
  position: absolute;
  top: 50%;
  inset-inline-end: 0.85rem;
  color: var(--PrimaryColor);
  transform: translateY(-50%);
}

.supervision-pricing__summary {
  flex: 1;
  gap: 0.7rem;
  margin: 0;
}

.supervision-pricing__summary > div {
  display: flex;
  flex: 1;
  min-width: 8rem;
  padding: 0.85rem;
  border: 1px solid var(--border-weak);
  border-radius: var(--radius-md);
  background: var(--bg-light);
  flex-direction: column;
  justify-content: center;
  gap: 0.35rem;
}

.supervision-pricing dd {
  margin: 0;
  color: var(--title-card-color);
  font-size: 1.15rem;
  font-weight: 800;
}

.supervision-pricing__summary .supervision-pricing__total {
  border-color: var(--PrimaryColor-alpha-30);
  background: var(--PrimaryColor-light);
}

.supervision-pricing__total dd {
  color: var(--PrimaryColor);
}

.supervision-pricing__total dd small {
  font-size: var(--xs-size);
}

@media (max-width: 900px) {
  .supervision-pricing__content,
  .supervision-pricing__summary {
    flex-direction: column;
  }

  .supervision-pricing__field {
    flex-basis: auto;
  }
}
</style>
