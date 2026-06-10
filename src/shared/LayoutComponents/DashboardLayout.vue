<script setup lang="ts">
  import SidebarNavigation from './SubComponents/SidebarNavigation.vue';
  import Navbar from './SubComponents/Navbar.vue';
  import FeatureHeader from '../FeatureHeader/FeatureHeader.vue';
</script>

<template>
  <main class="content">
    <div class="sidebar-container">
      <SidebarNavigation />
    </div>
    <section class="content-wrapper">
      <Navbar />
      <div class="main-content">
        <FeatureHeader />
        <slot />
      </div>
    </section>
  </main>
</template>

<style scoped>
  .mobile-nav {
    display: none;
  }

  @media (max-width: 600px) {
    .mobile-nav {
      display: block;
    }
  }
</style>
