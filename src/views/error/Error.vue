<script setup lang="ts">
  import AppErrorState from '@/shared/ConstructionStates/AppErrorState.vue';
  import { computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  const route = useRoute();
  const router = useRouter();
  const variant = computed(() => (route.path === '/server-error' ? '500' : '404'));
</script>
<template>
  <main class="error-page">
    <AppErrorState :variant="variant" show-home @retry="router.go(0)" />
  </main>
</template>

<style scoped lang="scss">
  .error-page {
    display: grid;
    min-height: 100vh;
    place-items: center;
    padding: clamp(1rem, 4vw, 3rem);
    background: var(--bg-body);
  }
</style>
