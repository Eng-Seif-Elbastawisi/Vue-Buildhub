import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useCountryStore = defineStore(
  'country',
  () => {
    const countryCode = ref<string>('eg');

    const isCountrySet = computed(() => countryCode.value.length > 0);

    const setCountryCode = (code: string) => {
      countryCode.value = code ? code.trim().toUpperCase() : '';
    };

    const getCountryCode = (): string => countryCode.value;

    return { countryCode, isCountrySet, setCountryCode, getCountryCode };
  },
  {
    persist: {
      key: 'country',
      storage: localStorage,
    },
  },
);
