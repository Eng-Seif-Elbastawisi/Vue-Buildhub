import { defineStore } from "pinia";
import { ref, watch } from "vue";

export const useThemeStore = defineStore(
  "theme",
  () => {
    const isDark = ref(false);

    const applyTheme = (dark: boolean) => {
      if (dark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };

    // Apply immediately when store is created (restores persisted state)
    applyTheme(isDark.value);

    watch(isDark, applyTheme);

    const toggle = () => {
      isDark.value = !isDark.value;
    };

    return { isDark, toggle };
  },
  {
    persist: {
      key: "theme",
      storage: localStorage,
    },
  },
);
