<script setup lang="ts">
  import { computed, onMounted, onUnmounted, ref } from 'vue';

  withDefaults(defineProps<{ variant?: 'boq' | 'building' }>(), { variant: 'boq' });

  const root = ref<HTMLElement | null>(null);
  const isInViewport = ref(true);
  const isDocumentVisible = ref(true);
  const active = computed(() => isInViewport.value && isDocumentVisible.value);
  let observer: IntersectionObserver | undefined;

  const updateVisibility = () => {
    isDocumentVisible.value = !document.hidden;
  };

  onMounted(() => {
    updateVisibility();
    document.addEventListener('visibilitychange', updateVisibility);
    if (root.value && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(([entry]) => {
        isInViewport.value = Boolean(entry?.isIntersecting);
      });
      observer.observe(root.value);
    }
  });

  onUnmounted(() => {
    observer?.disconnect();
    document.removeEventListener('visibilitychange', updateVisibility);
  });
</script>

<template>
  <span
    ref="root"
    class="construction-motion-accent"
    :class="[
      `construction-motion-accent--${variant}`,
      { 'construction-motion-accent--paused': !active },
    ]"
    aria-hidden="true"
  >
    <template v-if="variant === 'building'">
      <span class="construction-motion-accent__frame">
        <span v-for="floor in 3" :key="floor" class="construction-motion-accent__floor" />
      </span>
      <span class="construction-motion-accent__base" />
    </template>
    <span v-else class="construction-motion-accent__measure" />
  </span>
</template>

<style scoped lang="scss">
  .construction-motion-accent {
    --construction-start: -100%;
    --construction-origin: left center;

    display: block;
    color: var(--quote-copper, var(--PrimaryColor));
    pointer-events: none;
  }

  :global([dir='rtl'] .construction-motion-accent) {
    --construction-start: 100%;
    --construction-origin: right center;
  }

  .construction-motion-accent--boq {
    position: absolute;
    z-index: 1;
    inset: 0;
    overflow: hidden;
  }

  .construction-motion-accent__measure {
    position: absolute;
    inset: 0;
    border-inline-end: 2px solid currentColor;
    opacity: 0;
    animation: construction-measure var(--motion-loading-cycle, 1400ms) var(--motion-ease, ease-out)
      infinite;
  }

  .construction-motion-accent__measure::after {
    position: absolute;
    inset-block: 0;
    inset-inline-end: -5px;
    width: 5px;
    background: repeating-linear-gradient(to bottom, currentColor 0 1px, transparent 1px 18px);
    content: '';
    opacity: 0.6;
  }

  .construction-motion-accent--building {
    position: relative;
    width: 96px;
    height: 76px;
    flex: 0 0 auto;
  }

  .construction-motion-accent__frame {
    position: absolute;
    inset: 6px 12px 9px;
    display: flex;
    flex-direction: column-reverse;
    justify-content: space-around;
    border-inline: 1px solid color-mix(in sRGB, currentColor 50%, transparent);
  }

  .construction-motion-accent__floor {
    display: block;
    height: 8px;
    margin-inline: -5px;
    border: 1px solid currentColor;
    background: color-mix(in sRGB, currentColor 22%, transparent);
    transform: scaleX(0);
    transform-origin: var(--construction-origin);
    animation: construction-floor var(--motion-loading-cycle, 1400ms) var(--motion-ease, ease-out)
      infinite;
  }

  .construction-motion-accent__floor:nth-child(2) {
    animation-delay: 100ms;
  }

  .construction-motion-accent__floor:nth-child(3) {
    animation-delay: 200ms;
  }

  .construction-motion-accent__base {
    position: absolute;
    inset-inline: 3px;
    inset-block-end: 4px;
    height: 2px;
    background: currentColor;
    transform: scaleX(0);
    transform-origin: var(--construction-origin);
    animation: construction-floor var(--motion-loading-cycle, 1400ms) var(--motion-ease, ease-out)
      infinite;
  }

  @keyframes construction-measure {
    0% {
      opacity: 0;
      transform: translateX(var(--construction-start));
    }

    8% {
      opacity: 0.7;
    }

    72% {
      opacity: 0.7;
      transform: translateX(0);
    }

    78%,
    100% {
      opacity: 0;
      transform: translateX(0);
    }
  }

  @keyframes construction-floor {
    0% {
      transform: scaleX(0);
      opacity: 0.35;
    }

    68%,
    88% {
      transform: scaleX(1);
      opacity: 0.85;
    }

    100% {
      transform: scaleX(1);
      opacity: 0.45;
    }
  }

  .construction-motion-accent--paused
    :is(
      .construction-motion-accent__measure,
      .construction-motion-accent__floor,
      .construction-motion-accent__base
    ) {
    animation-play-state: paused;
  }

  @media (prefers-reduced-motion: reduce) {
    .construction-motion-accent__measure {
      display: none;
    }

    .construction-motion-accent__floor,
    .construction-motion-accent__base {
      animation: none;
      transform: scaleX(1);
      opacity: 0.8;
    }
  }
</style>
