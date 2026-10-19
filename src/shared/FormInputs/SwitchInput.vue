<script setup lang="ts">
  import { watch } from 'vue';
  import ToggleSwitch from 'primevue/toggleswitch';

  import FieldHelpIcon from '@/shared/components/form/FieldHelpIcon.vue';

  const emit = defineEmits(['update:value']);

  interface SwitchField {
    key: string;
    label: string;
    placeholder: string;
    value: string;
    enabled: boolean;
    helpTitle?: string;
    helpText?: string;
    helpExamples?: string[];
    showHelp?: boolean;
  }

  const props = withDefaults(
    defineProps<{
      fields: SwitchField[];
      switch_title?: string;
      switch_reverse?: boolean;
      helpTitle?: string;
      helpText?: string;
      helpExamples?: string[];
      showHelp?: boolean;
    }>(),
    {
      helpTitle: '',
      helpText: '',
      helpExamples: () => [],
      showHelp: true,
    },
  );

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
        <span class="field-help-label-row">
          <label class="title" :for="field.key">{{ $t(field.label) }}</label>

          <FieldHelpIcon
            :label="$t(field.label)"
            :field-name="field.key"
            :field-id="field.key"
            :help-title="field.helpTitle ?? helpTitle"
            :help-text="field.helpText ?? helpText"
            :help-examples="field.helpExamples ?? helpExamples"
            :show-help="field.showHelp ?? showHelp"
          />
        </span>
        <div class="switch-btn">
          <p class="title">{{ switch_title }}</p>
          <ToggleSwitch v-model="field.enabled" :aria-label="switch_title || $t(field.label)" />
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
