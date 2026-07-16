<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import DashboardLayout from '@/shared/LayoutComponents/DashboardLayout.vue';

  const { locale } = useI18n();
</script>

<template>
  <DashboardLayout>
    <RouterView :key="locale" />
  </DashboardLayout>
</template>
