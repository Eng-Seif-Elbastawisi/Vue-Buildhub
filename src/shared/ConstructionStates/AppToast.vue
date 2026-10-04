<script setup lang="ts">
  import ConstructionScene from './ConstructionScene.vue';
  defineProps<{
    type: 'success' | 'error' | 'warning' | 'info';
    title?: string;
    message: string;
  }>();
</script>

<template>
  <div class="app-toast" :role="type === 'error' || type === 'warning' ? 'alert' : 'status'">
    <ConstructionScene :variant="type === 'success' ? 'toast-success' : 'toast-error'" />
    <div class="app-toast__copy">
      <strong v-if="title">{{ title }}</strong>
      <p>{{ message }}</p>
    </div>
  </div>
</template>

<style scoped>
  .app-toast {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-width: 0;
  }

  .app-toast :deep(.construction-scene) {
    width: 64px;
    flex: 0 0 64px;
    margin: 0;
  }

  .app-toast :deep(.construction-scene--toast-error) {
    scale: 1.3;
  }

  .app-toast__copy {
    min-width: 0;
  }

  strong {
    display: block;
    margin-bottom: 0.2rem;
    color: var(--gray-900);
  }

  p {
    margin: 0;
    color: var(--gray-700);
    line-height: 1.5;
    overflow-wrap: anywhere;
    white-space: pre-line;
  }
</style>
