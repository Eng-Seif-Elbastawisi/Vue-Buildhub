<script setup lang="ts">
  import ConstructionScene from './ConstructionScene.vue';
  defineProps<{ title: string; message?: string }>();
</script>

<template>
  <div class="app-empty-state">
    <ConstructionScene variant="empty" />
    <h2>{{ title }}</h2>
    <p v-if="message">{{ message }}</p>
    <slot />
  </div>
</template>

<style scoped>
  .app-empty-state {
    display: grid;
    justify-items: center;
    gap: 0.5rem;
    padding: 2rem 1rem;
    text-align: center;
  }

  .app-empty-state :deep(.construction-scene) {
    max-width: 180px;
  }

  h2 {
    margin: 0;
    color: var(--gray-900);
    font-size: 1.125rem;
  }

  p {
    margin: 0 0 0.5rem;
    color: var(--gray-600);
  }
</style>
