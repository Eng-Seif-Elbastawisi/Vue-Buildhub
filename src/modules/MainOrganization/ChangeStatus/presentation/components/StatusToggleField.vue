<script setup lang="ts">
  import ToggleSwitch from 'primevue/toggleswitch';

  withDefaults(
    defineProps<{
      modelValue: boolean;
      inputId: string;
      disabled?: boolean;
    }>(),
    {
      disabled: false,
    },
  );

  const emit = defineEmits<{
    'update:modelValue': [value: boolean];
  }>();
</script>

<template>
  <div class="status-field" :class="{ 'status-field--disabled': disabled }">
    <label class="status-field__label" :for="inputId">{{ $t('status') }}</label>

    <div class="status-field__control">
      <ToggleSwitch
        :input-id="inputId"
        :model-value="modelValue"
        :disabled="disabled"
        @update:model-value="emit('update:modelValue', $event)"
      />

      <span class="status-field__text" :class="{ 'status-field__text--active': modelValue }">
        {{ modelValue ? $t('active') : $t('inactive') }}
      </span>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .status-field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .status-field--disabled {
    pointer-events: none;
    opacity: 0.7;
  }

  .status-field__label {
    color: var(--bread-crumb-color-span);
  }

  .status-field__control {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-height: 46px;
  }

  .status-field__text {
    color: var(--gray-5);
  }

  .status-field__text--active {
    color: var(--primary-color);
  }
</style>
