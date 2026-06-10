<script setup lang="ts">
  import { ref, computed, watch } from 'vue';

  interface Props {
    fieldKey: string;
    modelValue?: Record<string, string>;
    languages?: string[];
    label?: string;
    placeholder?: string;
    type?: 'title' | 'description';
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: () => ({}),
    languages: () => ['en', 'ar'],
    label: '',
    placeholder: '',
    type: 'title',
  });

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

  const handleLangSwitch = (lang: string) => {
    activeLang.value = lang;
  };
</script>

<template>
  <div class="multi-lang-input">
    <div class="header-input">
      <label v-if="label" class="field-label">{{ label }}</label>

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

    <div class="input-wrap">
      <textarea
        v-if="type == 'description'"
        v-model="currentValue"
        type="text"
        :placeholder="
          placeholder || `Enter ${label.toLowerCase()} in ${activeLang?.toUpperCase()}...`
        "
        class="field-input"
        :dir="activeLang === 'ar' ? 'rtl' : 'ltr'"
        
      ></textarea>
      <input
        v-else
        v-model="currentValue"
        type="text"
        :placeholder="
          placeholder || `Enter ${label.toLowerCase()} in ${activeLang?.toUpperCase()}...`
        "
        class="field-input"
        :dir="activeLang === 'ar' ? 'rtl' : 'ltr'"
      />
      <span class="active-indicator">{{ activeLang?.toUpperCase() }}</span>
    </div>
  </div>
</template>
