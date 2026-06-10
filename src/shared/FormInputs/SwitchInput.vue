<script setup lang="ts">
  import { watch } from 'vue';
  import ToggleSwitch from 'primevue/toggleswitch';

  const emit = defineEmits(['update:value']);

  const props = defineProps<{
    fields: {
      key: string;
      label: string;
      placeholder: string;
      value: string;
      enabled: boolean;
    }[];
    switch_title?: string;
    switch_reverse?: boolean;
  }>();

  watch(
    () => props.fields,
    (newVal) => {
      const payload: Record<string, string> = {};
      newVal.forEach((field) => {
        if (props.switch_reverse) {
          payload[field.key] = field.enabled ? '' : field.value;
          if (field.enabled) {
            field.value = '';
          }
        } else {
          payload[field.key] = field.enabled ? field.value : '';
        }
      });
      emit('update:value', payload);
    },
    { deep: true },
  );
</script>

<template>
  <div class="zone-data-container">
    <div v-for="field in fields" :key="field.key" class="input-wrapper">
      <div class="input-title">
        <label class="title" :for="field.key">{{ $t(field.label) }}</label>
        <div class="switch-btn">
          <p class="title">{{ switch_title }}</p>
          <ToggleSwitch v-model="field.enabled" />
        </div>
      </div>
      <input
        :id="field.key"
        v-model="field.value"
        type="text"
        :placeholder="field.placeholder"
        :disabled="switch_reverse ? field.enabled : !field.enabled"
      />
    </div>
  </div>
</template>
