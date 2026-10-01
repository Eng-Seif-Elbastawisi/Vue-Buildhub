<script setup lang="ts">
  import { onMounted, onUnmounted, ref } from 'vue';

  const loader = ref<HTMLElement | null>(null);
  const isVisible = ref(true);
  const isDocumentVisible = ref(true);
  let observer: IntersectionObserver | undefined;

  const updateDocumentVisibility = () => {
    isDocumentVisible.value = !document.hidden;
  };

  onMounted(() => {
    updateDocumentVisibility();
    document.addEventListener('visibilitychange', updateDocumentVisibility);

    if (loader.value && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver((entries) => {
        const entry = entries[0];
        if (entry) isVisible.value = entry.isIntersecting;
      });
      observer.observe(loader.value);
    }
  });

  onUnmounted(() => {
    observer?.disconnect();
    document.removeEventListener('visibilitychange', updateDocumentVisibility);
  });
</script>

<template>
  <section
    ref="loader"
    class="boq-measurement-loader"
    :class="{ 'boq-measurement-loader--paused': !isVisible || !isDocumentVisible }"
    role="status"
    aria-live="polite"
    aria-busy="true"
  >
    <div class="boq-measurement-loader__heading">
      <div class="boq-measurement-loader__heading-placeholders" aria-hidden="true">
        <span class="boq-measurement-loader__block boq-measurement-loader__block--heading" />
        <span class="boq-measurement-loader__block boq-measurement-loader__block--subheading" />
      </div>
      <p class="boq-measurement-loader__label">{{ $t('execution_quote.measurement_loading') }}</p>
    </div>

    <div class="boq-measurement-loader__sheet" aria-hidden="true">
      <div class="boq-measurement-loader__rows">
        <div class="boq-measurement-loader__row boq-measurement-loader__row--header">
          <span v-for="column in 5" :key="column" class="boq-measurement-loader__block" />
        </div>

        <div v-for="row in 4" :key="row" class="boq-measurement-loader__row">
          <span v-for="column in 5" :key="column" class="boq-measurement-loader__block" />
        </div>

        <div class="boq-measurement-loader__sweep" />
      </div>

      <div class="boq-measurement-loader__footer">
        <span class="boq-measurement-loader__block boq-measurement-loader__block--footer-label" />
        <span class="boq-measurement-loader__block boq-measurement-loader__block--total" />
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
  .boq-measurement-loader {
    min-width: 0;
    overflow: hidden;
    border: 1px solid var(--quote-line);
    border-radius: 12px;
    color: var(--quote-ink);
    background: var(--quote-paper);
    box-shadow: 0 7px 20px rgb(39 42 43 / 5%);
  }

  .boq-measurement-loader__heading {
    display: flex;
    min-height: 70px;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 14px 18px;
    border-block-end: 1px solid var(--quote-line);
  }

  .boq-measurement-loader__heading-placeholders {
    display: grid;
    width: min(38%, 16rem);
    gap: 9px;
  }

  .boq-measurement-loader__label {
    margin: 0;
    color: var(--quote-muted);
    font-size: 0.82rem;
    line-height: 1.5;
    text-align: end;
  }

  .boq-measurement-loader__sheet {
    padding: 0 18px 14px;
  }

  .boq-measurement-loader__rows {
    position: relative;
    overflow: hidden;
  }

  .boq-measurement-loader__row {
    display: grid;
    min-height: 48px;
    grid-template-columns:
      minmax(0, 2.5fr) minmax(0, 0.65fr) minmax(0, 0.65fr) minmax(0, 1fr)
      minmax(0, 1fr);
    align-items: center;
    gap: clamp(8px, 2vw, 28px);
    padding-inline: 12px;
    border-block-end: 1px solid var(--quote-line);
  }

  .boq-measurement-loader__row--header {
    min-height: 40px;
    background: var(--quote-warm-white);
  }

  .boq-measurement-loader__block {
    display: block;
    width: 70%;
    height: 9px;
    border-radius: 3px;
    background: var(--quote-field-line);
    opacity: 0.62;
    animation: boq-measurement-breathe 2.4s ease-in-out infinite;
  }

  .boq-measurement-loader__row--header .boq-measurement-loader__block {
    height: 7px;
    opacity: 0.5;
  }

  .boq-measurement-loader__row .boq-measurement-loader__block:first-child {
    width: 72%;
  }

  .boq-measurement-loader__row:nth-child(2) .boq-measurement-loader__block:first-child,
  .boq-measurement-loader__row:nth-child(4) .boq-measurement-loader__block:first-child {
    width: 88%;
  }

  .boq-measurement-loader__row .boq-measurement-loader__block:nth-child(2),
  .boq-measurement-loader__row .boq-measurement-loader__block:nth-child(3) {
    width: 48%;
  }

  .boq-measurement-loader__row .boq-measurement-loader__block:last-child {
    width: 82%;
    margin-inline-start: auto;
  }

  .boq-measurement-loader__sweep {
    position: absolute;
    z-index: 1;
    inset: 40px 0 0;
    border-inline-end: 2px solid var(--quote-copper);
    pointer-events: none;
    animation: boq-measurement-sweep-ltr 2.6s cubic-bezier(0.3, 0.1, 0.65, 1) infinite;
  }

  .boq-measurement-loader__sweep::after {
    position: absolute;
    inset-block: 0;
    inset-inline-end: -5px;
    width: 5px;
    background: repeating-linear-gradient(
      to bottom,
      var(--quote-copper) 0 1px,
      transparent 1px 18px
    );
    content: '';
    opacity: 0.65;
  }

  [dir='rtl'] .boq-measurement-loader__sweep {
    animation-name: boq-measurement-sweep-rtl;
  }

  .boq-measurement-loader__footer {
    display: flex;
    min-height: 64px;
    align-items: center;
    justify-content: flex-end;
    gap: 16px;
    padding-inline: 12px;
  }

  .boq-measurement-loader__block--heading {
    width: 66%;
    height: 11px;
  }

  .boq-measurement-loader__block--subheading {
    width: 43%;
    height: 7px;
  }

  .boq-measurement-loader__block--footer-label {
    width: 4.5rem;
    height: 8px;
  }

  .boq-measurement-loader__block--total {
    width: clamp(5.5rem, 12vw, 9rem);
    height: 23px;
    border: 1px solid var(--quote-copper-border);
    border-radius: 5px;
    background: var(--quote-copper-soft);
    opacity: 0.68;
    animation: boq-measurement-total 2.6s ease-in-out infinite;
  }

  .boq-measurement-loader--paused .boq-measurement-loader__block,
  .boq-measurement-loader--paused .boq-measurement-loader__sweep {
    animation-play-state: paused;
  }

  @keyframes boq-measurement-sweep-ltr {
    0% {
      opacity: 0;
      transform: translateX(-100%);
    }

    5% {
      opacity: 0.7;
    }

    44% {
      opacity: 0.7;
      transform: translateX(0);
    }

    48%,
    100% {
      opacity: 0;
      transform: translateX(0);
    }
  }

  @keyframes boq-measurement-sweep-rtl {
    0% {
      opacity: 0;
      transform: translateX(100%);
    }

    5% {
      opacity: 0.7;
    }

    44% {
      opacity: 0.7;
      transform: translateX(0);
    }

    48%,
    100% {
      opacity: 0;
      transform: translateX(0);
    }
  }

  @keyframes boq-measurement-breathe {
    0%,
    100% {
      opacity: 0.58;
    }

    50% {
      opacity: 0.78;
    }
  }

  @keyframes boq-measurement-total {
    0%,
    44%,
    100% {
      opacity: 0.68;
    }

    58% {
      opacity: 0.95;
    }

    75% {
      opacity: 0.68;
    }
  }

  @media (max-width: 600px) {
    .boq-measurement-loader__heading {
      min-height: 62px;
      padding: 12px;
    }

    .boq-measurement-loader__sheet {
      padding-inline: 10px;
    }

    .boq-measurement-loader__row {
      min-height: 46px;
      grid-template-columns: minmax(0, 2fr) minmax(0, 0.75fr) minmax(0, 1fr);
      gap: 8px;
      padding-inline: 8px;
    }

    .boq-measurement-loader__row > :nth-child(3),
    .boq-measurement-loader__row > :nth-child(4) {
      display: none;
    }

    .boq-measurement-loader__footer {
      min-height: 56px;
      padding-inline: 8px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .boq-measurement-loader__block,
    .boq-measurement-loader__sweep {
      animation: none;
    }

    .boq-measurement-loader__sweep {
      display: none;
    }
  }
</style>
