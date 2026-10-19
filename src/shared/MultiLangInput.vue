<script setup lang="ts">
  import { ref, computed, useId, watch } from 'vue';
  import { useI18n } from 'vue-i18n';

  import FieldHelpIcon from '@/shared/components/form/FieldHelpIcon.vue';

  interface Props {
    fieldKey: string;
    modelValue?: Record<string, string>;
    languages?: string[];
    label?: string;
    placeholder?: string;
    type?: 'title' | 'description';
    helpTitle?: string;
    helpText?: string;
    helpExamples?: string[];
    showHelp?: boolean;
    required?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: () => ({}),
    languages: () => ['en', 'ar'],
    label: '',
    placeholder: '',
    type: 'title',
    helpTitle: '',
    helpText: '',
    helpExamples: () => [],
    showHelp: true,
    required: false,
  });

  const { t } = useI18n();
  const inputId = useId();

  const emit = defineEmits<{
    (e: 'update:modelValue', value: Record<string, string>): void;
    (e: 'update:data', value: Record<string, Record<string, string>>): void;
  }>();

  // Active language state
  const activeLang = ref(props.languages[0]);

  // Internal state to handle reactivity smoothly
  const internalValue = ref({ ...props.modelValue });

  // Sync internal state with prop changes
  watch(
    () => props.modelValue,
    (newVal) => {
      internalValue.value = { ...newVal };
    },
    { deep: true },
  );

  // Computed value for the input field
  const currentValue = computed({
    get: () => internalValue.value[activeLang.value!] || '',
    set: (val: string) => {
      internalValue.value[activeLang.value!] = val;

      // Emit the record of languages
      emit('update:modelValue', { ...internalValue.value });

      // Emit the wrapped data wititleth fieldKey
      emit('update:data', {
        [props.fieldKey]: { ...internalValue.value },
      });
    },
  });

  const inputPlaceholder = computed(
    () =>
      props.placeholder ||
      t('enter_label_in_language', {
        label: props.label.toLowerCase(),
        language: activeLang.value?.toUpperCase(),
      }),
  );

  const handleLangSwitch = (lang: string) => {
    activeLang.value = lang;
  };
</script>

<template>
  <div class="multi-lang-input">
    <div class="header-input">
      <span v-if="label" class="field-help-label-row">
        <label class="field-label" :for="inputId">
          <span v-if="required" class="required-indicator" aria-hidden="true">*</span>
          {{ label }}
        </label>

        <FieldHelpIcon
          :label="label"
          :field-name="fieldKey"
          :field-id="inputId"
          :help-title="helpTitle"
          :help-text="helpText"
          :help-examples="helpExamples"
          :show-help="showHelp"
        />
      </span>

      <div class="lang-switcher">
        <button
          v-for="lang in languages"
          :key="lang"
          type="button"
          class="lang-btn"
          :class="{ active: activeLang === lang }"
          @click="handleLangSwitch(lang)"
        >
          {{ lang.toUpperCase() }}
          <span v-if="internalValue[lang]" class="dot"></span>
        </button>
      </div>
    </div>

    <div class="input-wrap" :class="activeLang === 'ar' ? 'input-wrap--rtl' : 'input-wrap--ltr'">
      <textarea
        v-if="type === 'description'"
        :id="inputId"
        v-model="currentValue"
        :aria-required="required"
        :placeholder="inputPlaceholder"
        class="field-input field-input--textarea"
        :dir="activeLang === 'ar' ? 'rtl' : 'ltr'"
      ></textarea>

      <input
        v-else
        :id="inputId"
        v-model="currentValue"
        :aria-required="required"
        type="text"
        :placeholder="inputPlaceholder"
        class="field-input field-input--text"
        :dir="activeLang === 'ar' ? 'rtl' : 'ltr'"
      />
      <span class="active-indicator">{{ activeLang?.toUpperCase() }}</span>
    </div>
  </div>
</template>

<style scoped>
  .field-input {
    width: 100%;
    border: 1px solid var(--bh-field-line);
    border-radius: var(--bh-radius-control);
    background: var(--bh-surface-raised);
    outline: none;
    transition: all 0.25s ease;
    font-family: 'Medium';
    font-weight: 400;
    font-size: var(--sm-size);
    color: var(--bh-text);
  }

  .required-indicator {
    color: var(--danger);
  }

  .field-input--text {
    min-height: var(--bh-control-height);
    padding: 0 16px;
  }

  .field-input--textarea {
    height: 100px;
    padding: 12px 16px;
    resize: vertical;
    border-radius: var(--bh-radius-control);
  }

  .input-wrap--ltr > .field-input {
    padding-right: 50px !important;
    padding-left: 16px !important;
    text-align: left;
  }

  .input-wrap--ltr > .active-indicator {
    right: 12px;
    left: auto;
  }

  .input-wrap--rtl > .field-input {
    padding-right: 16px !important;
    padding-left: 50px !important;
    text-align: right;
  }

  .input-wrap--rtl > .active-indicator {
    right: auto;
    left: 12px;
  }
</style>
