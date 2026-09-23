<script setup lang="ts">
  const props = defineProps<{
    modelValue: number | null;
  }>();

  const emit = defineEmits<{
    (event: 'update:modelValue', value: number | null): void;
  }>();

  const onInput = (event: Event) => {
    const raw = (event.target as HTMLInputElement).value;
    if (raw === '') {
      emit('update:modelValue', null);
      return;
    }

    const value = Number(raw);
    emit('update:modelValue', Number.isFinite(value) ? Math.max(value, 0) : props.modelValue);
  };
</script>

<template>
  <section class="execution-builder-card client-price">
    <div class="builder-section-title">
      <h2>{{ $t('execution_quote.client_stage_price') }}</h2>
      <span class="builder-badge">{{ $t('execution_quote.always_visible') }}</span>
    </div>

    <input
      :value="modelValue ?? ''"
      type="number"
      min="0"
      step="0.01"
      :placeholder="$t('execution_quote.placeholders.client_stage_price')"
      @input="onInput"
    />
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

  .client-price input {
    width: 100%;
    min-height: 2.8rem;
    margin-top: 0.85rem;
    padding: 0.55rem 0.7rem;
    border: 1px solid var(--input-border-color);
    border-radius: var(--radius-sm);
    background: var(--bg-card);
    color: var(--Title-input-Color);
  }
</style>
