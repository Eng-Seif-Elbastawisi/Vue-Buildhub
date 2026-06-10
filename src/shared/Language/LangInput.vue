<script setup lang="ts">
  import { ref, watch } from 'vue';

  type SupportedLang = 'en' | 'ar' | 'fr' | 'es' | 'zh';

  const props = defineProps<{
    modelValue: Record<string, string>;
    langs: { locale: SupportedLang; title: string }[];
    type?: string;
  }>();

  const emit = defineEmits(['update:modelValue']);

  const lang = ref<SupportedLang>(props?.langs[0]!.locale);
  const value = ref('');

  watch(lang, () => {
    value.value = props.modelValue?.[lang.value] || '';
  });

  watch(value, (v) => {
    const data = { ...props.modelValue };
    data[lang.value] = v;
    emit('update:modelValue', data);
  });

  // const c = 0;

  watch(
    () => props.modelValue,
    () => {
      // console.log(c);
      value.value = props.modelValue?.[lang.value] || '';
    },
    { immediate: true },
  );
</script>

<template>
  <div class="lang-input-wrapper">
    <!-- input -->
    <input v-model="value" :type="type || 'text'" class="input" placeholder="Enter value" />

    <!-- language selector inside input -->
    <select v-model="lang" class="lang-select">
      <option v-for="l in langs" :key="l.locale" :value="l.locale">
        {{ l.locale.toUpperCase() }}
      </option>
    </select>
  </div>
</template>

<style scoped>
  .lang-input-wrapper {
    position: relative;
  }

  .input {
    width: 100%;
    padding-right: 70px;
  }

  .lang-select {
    position: absolute;
    right: 5px;
    top: 50%;
    transform: translateY(-50%);
    border: none;
    background: transparent;
    font-weight: bold;
    cursor: pointer;
  }
</style>
