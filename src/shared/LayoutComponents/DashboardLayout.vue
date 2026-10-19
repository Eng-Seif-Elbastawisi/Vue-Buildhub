<script setup lang="ts">
  import SidebarNavigation from './SubComponents/SidebarNavigation.vue';
  import Navbar from './SubComponents/Navbar.vue';
  import FeatureHeader from '../FeatureHeader/FeatureHeader.vue';
  import AnimatedBreadcrumb from '../FeatureHeader/AnimatedBreadcrumb.vue';
  import MobileTopBar from './SubComponents/MobileTopBar.vue';
  import MobileSidebarDrawer from './SubComponents/MobileSidebarDrawer.vue';
  import { computed, provide, ref, watch } from 'vue';
  import { useRoute } from 'vue-router';

  import TimelineStartRequiredAlert from '@/modules/MainOrganization/ExecutionQuotes/shared/components/TimelineStartRequiredAlert.vue';

  const route = useRoute();
  const executionQuoteId = computed(() => {
    const match = route.path?.match(
      /^\/(?:organization|mainportal)\/execution-quotes\/show\/(\d+)(?:\/|$)/,
    );
    const id = Number(match?.[1]);
    return Number.isSafeInteger(id) && id > 0 ? id : null;
  });
  const isMobileSidebarOpen = ref(false);
  const breadcrumbCurrentLabel = ref<string | undefined>();

  provide('dashboard-breadcrumb-current-label', breadcrumbCurrentLabel);

  watch(
    () => route.fullPath,
    () => {
      breadcrumbCurrentLabel.value = undefined;
    },
  );
</script>

<template>
  <main class="content dashboard-shell">
    <MobileTopBar @open-sidebar="isMobileSidebarOpen = true" />
    <MobileSidebarDrawer v-model:open="isMobileSidebarOpen" />

    <div class="sidebar-container" :aria-label="$t('main_sidebar')">
      <SidebarNavigation />
    </div>
    <section class="content-wrapper">
      <Navbar class="desktop-navbar" />
      <div class="dashboard-breadcrumb-row">
        <AnimatedBreadcrumb :current-label="breadcrumbCurrentLabel" />
      </div>
      <div class="main-content">
        <FeatureHeader />
        <slot />
      </div>
    </section>
    <TimelineStartRequiredAlert
      v-if="executionQuoteId"
      :key="executionQuoteId"
      :quote-id="executionQuoteId"
    />
  </main>
</template>

<style scoped>
  .sidebar-container {
    position: fixed;
    inset-block: 0;
    inset-inline-start: 0;
    z-index: var(--bh-z-rail);
    width: 0;
    min-height: 100vh;
    pointer-events: none;
  }

  .sidebar-container :deep(.sidebar-shell) {
    pointer-events: auto;
  }

  .desktop-navbar {
    display: block;
  }

  .mobile-nav {
    display: none;
  }

  @media (max-width: 600px) {
    .mobile-nav {
      display: block;
    }
  }

  @media (max-width: 1023px) {
    .sidebar-container,
    .desktop-navbar {
      display: none;
    }

    .content-wrapper {
      padding-top: 64px;
    }
  }
</style>

<style lang="scss" src="./styles/dashboard-shell.scss"></style>
