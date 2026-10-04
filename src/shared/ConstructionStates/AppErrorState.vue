<script setup lang="ts">
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import ConstructionScene from './ConstructionScene.vue';

  const props = withDefaults(
    defineProps<{
      variant?: '404' | '500' | 'section';
      title?: string;
      message?: string;
      homeTo?: string;
      showHome?: boolean;
    }>(),
    { variant: 'section', showHome: false, homeTo: '/', title: undefined, message: undefined },
  );
  const emit = defineEmits<{ retry: [] }>();
  const { t, te } = useI18n();
  const translate = (value: string) => (te(value) ? t(value) : value);
  const title = computed(() =>
    props.title ? translate(props.title) : t(`construction_states.${props.variant}_title`),
  );
  const message = computed(() =>
    props.message ? translate(props.message) : t(`construction_states.${props.variant}_message`),
  );
</script>

<template>
  <section class="app-error-state" :class="`app-error-state--${variant}`" role="alert">
    <ConstructionScene :variant="variant" />
    <div class="app-error-state__content">
      <strong v-if="variant !== 'section'" class="app-error-state__code">{{ variant }}</strong>
      <h2 v-if="variant === 'section'">{{ title }}</h2>
      <h1 v-else>{{ title }}</h1>
      <p>{{ message }}</p>
      <div class="app-error-state__actions">
        <button type="button" class="app-error-state__primary" @click="emit('retry')">
          {{ $t('try_again') }}
        </button>
        <RouterLink v-if="showHome" :to="homeTo" class="app-error-state__secondary">
          {{ $t('home') }}
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
  .app-error-state {
    display: flex;
    width: 100%;
    min-height: 270px;
    align-items: center;
    justify-content: center;
    gap: clamp(1rem, 4vw, 3rem);
    padding: clamp(1.25rem, 4vw, 3rem);
    border-radius: var(--card-radius, 16px);
    background: var(--quote-paper, var(--bg-card));
    box-shadow: var(--shadow-sm);
    text-align: start;
  }

  .app-error-state--404,
  .app-error-state--500 {
    min-height: min(580px, 85vh);
  }

  :global([dir='rtl']) .app-error-state--404,
  :global([dir='rtl']) .app-error-state--500 {
    flex-direction: row-reverse;
  }

  .app-error-state :deep(.construction-scene) {
    flex: 0 1 320px;
    margin: 0;
  }

  .app-error-state--404 :deep(.construction-scene),
  .app-error-state--500 :deep(.construction-scene) {
    max-width: 440px;
    flex-basis: 440px;
  }

  .app-error-state__content {
    max-width: 24rem;
    animation: content-appear 350ms 780ms ease-out both;
  }

  .app-error-state--section .app-error-state__content {
    animation-delay: 150ms;
  }

  .app-error-state__code {
    display: block;
    color: var(--quote-copper, var(--PrimaryColor));
    font-size: clamp(3.5rem, 8vw, 6rem);
    line-height: 1;
  }

  h1,
  h2 {
    margin: 0.5rem 0;
    color: var(--gray-900);
    font-size: clamp(1.4rem, 2.2vw, 2rem);
  }

  p {
    margin: 0 0 1.5rem;
    color: var(--gray-600);
    line-height: 1.7;
  }

  .app-error-state__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .app-error-state__primary,
  .app-error-state__secondary {
    display: inline-flex;
    min-height: 42px;
    align-items: center;
    justify-content: center;
    padding: 0.625rem 1.25rem;
    border: 1px solid var(--quote-copper, var(--PrimaryColor));
    border-radius: 8px;
    font: inherit;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
  }

  .app-error-state__primary {
    color: var(--bg-card);
    background: var(--quote-copper, var(--PrimaryColor));
  }

  .app-error-state__secondary {
    color: var(--quote-copper, var(--PrimaryColor));
    background: transparent;
  }

  .app-error-state__primary:focus-visible,
  .app-error-state__secondary:focus-visible {
    outline: 3px solid var(--PrimaryColor-alpha-30);
    outline-offset: 2px;
  }

  @keyframes content-appear {
    from {
      opacity: 0;
      transform: translateY(5px);
    }

    to {
      opacity: 1;
      transform: none;
    }
  }

  @media (max-width: 620px) {
    .app-error-state {
      flex-direction: column;
      text-align: center;
    }

    .app-error-state--404,
    .app-error-state--500 {
      min-height: auto;
    }

    :global([dir='rtl']) .app-error-state--404,
    :global([dir='rtl']) .app-error-state--500 {
      flex-direction: column;
    }

    .app-error-state :deep(.construction-scene) {
      width: min(100%, 230px);
      flex: none;
    }

    .app-error-state__actions {
      justify-content: center;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .app-error-state__content {
      animation: none;
    }
  }
</style>
