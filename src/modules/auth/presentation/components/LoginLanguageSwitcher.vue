<script setup lang="ts">
  import { useLanguageSwitcher } from '@/shared/LayoutComponents/SubComponents/useLanguageSwitcher';

  const { currentLanguage, nextLanguage, toggleLanguage } = useLanguageSwitcher();
</script>

<template>
  <button
    type="button"
    class="login-form__language"
    :aria-label="$t(nextLanguage === 'ar' ? 'auth_switch_to_arabic' : 'auth_switch_to_english')"
    :title="$t(nextLanguage === 'ar' ? 'auth_switch_to_arabic' : 'auth_switch_to_english')"
    @click="toggleLanguage"
  >
    <i class="pi pi-globe" aria-hidden="true"></i>
    <span aria-hidden="true">{{ currentLanguage.toUpperCase() }}</span>
    <i class="pi pi-chevron-down" aria-hidden="true"></i>
  </button>
</template>
