<script setup lang="ts">
  import ConstructionScene from './ConstructionScene.vue';
  defineProps<{ state: 'success' | 'error'; title: string; message: string }>();
</script>

<template>
  <div class="app-delete-state-dialog" :role="state === 'error' ? 'alert' : 'status'">
    <ConstructionScene :variant="state === 'error' ? 'delete-error' : 'delete-success'" />
    <h3>{{ title }}</h3>
    <p>{{ message }}</p>
  </div>
</template>

<style scoped>
  .app-delete-state-dialog {
    display: grid;
    justify-items: center;
    gap: 0.5rem;
    text-align: center;
  }

  .app-delete-state-dialog :deep(.construction-scene) {
    max-width: 210px;
  }

  h3 {
    margin: 0;
    color: var(--gray-900);
    font-size: 1.2rem;
  }

  p {
    margin: 0;
    color: var(--gray-600);
    line-height: 1.6;
    white-space: pre-line;
  }
</style>
