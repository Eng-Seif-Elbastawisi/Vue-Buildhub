<script setup lang="ts">
  import { computed } from 'vue';
  import ConstructionScene from './ConstructionScene.vue';
  const props = withDefaults(defineProps<{ message: string; progress?: number; deleting?: boolean }>(), {
    progress: 0,
    deleting: false,
  });
  const progressScale = computed(() => Math.min(100, Math.max(0, props.progress)) / 100);
</script>

<template>
  <div class="app-loading-dialog" role="status" aria-live="polite">
    <ConstructionScene :variant="deleting ? 'delete-loading' : 'loading'" />
    <p>{{ message }}</p>
    <div
      class="app-loading-dialog__track"
      role="progressbar"
      :aria-valuenow="progress || undefined"
      :aria-valuemin="0"
      :aria-valuemax="100"
      :aria-label="$t('loading')"
    >
      <span
        :class="{ 'app-loading-dialog__indeterminate': !progress }"
        :style="progress ? { transform: `scaleX(${progressScale})` } : undefined"
      />
    </div>
    <small v-if="progress">{{ Math.round(progress) }}%</small>
  </div>
</template>

<style scoped>
  .app-loading-dialog {
    display: grid;
    justify-items: center;
    gap: 1rem;
    padding: 0.5rem;
    text-align: center;
  }

  .app-loading-dialog :deep(.construction-scene) {
    max-width: 220px;
  }

  p {
    margin: 0;
    color: var(--gray-900);
    font-weight: 600;
  }

  small {
    color: var(--gray-600);
  }

  .app-loading-dialog__track {
    width: min(100%, 280px);
    height: 8px;
    overflow: hidden;
    border-radius: 8px;
    background: var(--gray-200);
  }

  .app-loading-dialog__track span {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: inherit;
    background: var(--quote-copper, var(--PrimaryColor));
    transform-origin: left center;
    transition: transform 250ms ease;
  }

  :global([dir='rtl'] .app-loading-dialog__track span) {
    transform-origin: right center;
  }

  .app-loading-dialog__indeterminate {
    width: 35%;
    animation: loading-track 1700ms ease-in-out infinite alternate;
  }

  @keyframes loading-track {
    to {
      transform: translateX(185%);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .app-loading-dialog__track span {
      transition: none;
    }

    .app-loading-dialog__indeterminate {
      width: 100%;
      animation: none;
      opacity: 0.6;
    }
  }
</style>
