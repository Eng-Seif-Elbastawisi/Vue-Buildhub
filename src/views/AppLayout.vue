<script setup lang="ts">
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useRoute } from 'vue-router';
  import DashboardLayout from '@/shared/LayoutComponents/DashboardLayout.vue';
  import HomeDashboard from '@/modules/home/presentation/components/HomeDashboard.vue';

  const { locale } = useI18n();
  const route = useRoute();
  const pageFamily = computed(() => {
    const name = String(route.name ?? '').toLowerCase();
    if (/^(add|edit|build|create)(?:[ -]|$)/.test(name)) return 'form';
    if (/^(show|quote)(?:[ -]|$)/.test(name)) return 'detail';
    if (/system identity/.test(name)) return 'settings';
    return 'listing';
  });
  const homeWorkspace = computed(() => {
    if (/^\/admin\/?$/.test(route.path)) return 'admin';
    if (/^\/(organization|mainportal)\/?$/.test(route.path)) return 'organization';
    return null;
  });
</script>

<template>
  <DashboardLayout>
    <HomeDashboard
      v-if="homeWorkspace"
      :key="`${homeWorkspace}-${locale}`"
      :workspace="homeWorkspace"
    />
    <div
      v-else
      class="workspace-page"
      :class="`workspace-page--${pageFamily}`"
      :data-screen="route.name"
    >
      <RouterView :key="locale" />
    </div>
  </DashboardLayout>
</template>
