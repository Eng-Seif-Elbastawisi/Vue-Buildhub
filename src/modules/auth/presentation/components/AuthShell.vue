<script setup lang="ts">
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import BuildHubLogo from '@/assets/images/BuildHubLogo.jpg';

  const props = defineProps<{ mode: 'organization' | 'admin' }>();
  const { locale } = useI18n({ useScope: 'global' });
  const direction = computed(() => (locale.value === 'ar' ? 'rtl' : 'ltr'));
  const content = computed(() => ({
    badge: `auth_${props.mode}_badge`,
    brandSubtitle: `auth_${props.mode}_brand_subtitle`,
    firstAccent: `auth_${props.mode}_headline_first_accent`,
    firstRest: `auth_${props.mode}_headline_first_rest`,
    secondAccent: `auth_${props.mode}_headline_second_accent`,
    description: `auth_${props.mode}_description`,
  }));
</script>

<template>
  <main class="auth-workspace" :class="`auth-workspace--${mode}`" :dir="direction">
    <div class="auth-workspace__layout">
      <section class="auth-workspace__intro" :aria-labelledby="`${mode}-login-title`">
        <header class="auth-workspace__brand">
          <img :src="BuildHubLogo" :alt="$t('buildhub_logo')" />
          <div>
            <strong>{{ $t('buildhub') }}</strong>
            <p>{{ $t(content.brandSubtitle) }}</p>
          </div>
        </header>
        <div class="auth-workspace__copy">
          <h1 :id="`${mode}-login-title`">
            {{ $t(content.firstAccent) }} {{ $t(content.firstRest) }}
            <span>{{ $t(content.secondAccent) }}</span>
          </h1>
          <p>{{ $t(content.description) }}</p>
        </div>
        <p class="auth-workspace__portal">{{ $t(content.badge) }}</p>
      </section>
      <section class="auth-workspace__form" :aria-label="$t('auth_login_form_label')">
        <slot :mode="mode" :badge="$t(content.badge)" />
      </section>
    </div>
  </main>
</template>

<style scoped lang="scss">
  .auth-workspace {
    display: grid;
    min-height: 100dvh;
    place-items: center;
    padding: clamp(16px, 3vw, 48px);
    color: var(--bh-text);
    background: var(--bh-canvas);
    font-family: var(--bh-font);
  }

  .auth-workspace__layout {
    display: grid;
    width: min(100%, 1280px);
    min-height: 720px;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .auth-workspace__intro {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 56px;
    padding: clamp(24px, 4vw, 60px);
    border-radius: var(--bh-radius-panel);
    background: var(--bh-surface-secondary);
  }

  .auth-workspace__brand {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .auth-workspace__brand img {
    width: 48px;
    height: 48px;
    object-fit: contain;
    border-radius: var(--bh-radius-control);
  }

  .auth-workspace__brand strong {
    color: var(--bh-text);
    font-size: var(--bh-text-xl);
    font-weight: 600;
  }

  .auth-workspace__brand p {
    margin: 4px 0 0;
    color: var(--bh-muted);
    font-size: var(--bh-text-sm);
    line-height: 1.5;
  }

  .auth-workspace__copy h1 {
    margin: 0;
    color: var(--bh-text);
    font-size: clamp(2rem, 3.5vw, 3.25rem);
    font-weight: 500;
    line-height: 1.25;
    text-transform: none;
    text-wrap: balance;
  }

  .auth-workspace__copy h1 span {
    display: block;
    color: var(--bh-blue-ink);
  }

  .auth-workspace__copy p {
    max-width: 45ch;
    margin-block: 24px 0;
    color: var(--bh-muted);
    font-size: var(--bh-text-md);
    line-height: 1.8;
  }

  .auth-workspace__portal {
    align-self: flex-start;
    margin: 0;
    padding: 10px 18px;
    border-radius: var(--bh-radius-pill);
    background: var(--bh-surface);
    color: var(--bh-muted);
    font-size: var(--bh-text-sm);
  }

  .auth-workspace__form {
    display: grid;
    align-items: center;
    padding: clamp(24px, 4vw, 56px);
    border-radius: var(--bh-radius-panel);
    background: var(--bh-surface);
  }

  .auth-workspace__form :deep(.login-form) {
    display: flex;
    width: 100%;
    flex-direction: column;
    gap: 32px;
    margin: 0;
    padding: 0;
    border: 0;
    background: transparent;
    box-shadow: none;
  }

  .auth-workspace__form :deep(.title) {
    margin: 0;
    text-align: start;
  }

  .auth-workspace__form :deep(.title h2) {
    margin: 0;
    color: var(--bh-text);
    font-size: var(--bh-text-page);
    line-height: 1.3;
  }

  .auth-workspace__form :deep(.title p) {
    margin: 12px 0 0;
    color: var(--bh-muted);
    font-size: var(--bh-text-sm);
    line-height: 1.6;
  }

  .auth-workspace__form :deep(.inputs) {
    display: grid;
    width: 100%;
    gap: 24px;
  }

  .auth-workspace__form :deep(.input-wrapper) {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    grid-auto-flow: row;
    width: 100%;
    min-width: 0;
    padding-inline: 0;
    gap: 8px;
  }

  .auth-workspace__form :deep(.input-wrapper label) {
    color: var(--bh-text);
    font-size: var(--bh-text-sm);
  }

  .auth-workspace__form :deep(.input-wrapper input) {
    width: 100%;
    height: 48px;
    padding: 12px 16px;
    padding-inline-end: 48px;
    color: var(--bh-text);
    background: var(--bh-surface-raised);
    border: 1px solid var(--bh-field-line);
    border-radius: var(--bh-radius-control);
  }

  .auth-workspace__form :deep(.auth-input-wrap) {
    position: relative;
    width: 100%;
    min-width: 0;
    max-width: none;
    justify-self: stretch;
  }

  .auth-workspace__form :deep(.auth-password-toggle) {
    position: absolute;
    inset-inline-end: 8px;
    inset-block-start: 4px;
    width: 40px;
    height: 40px;
    padding: 10px;
    border: 0;
    border-radius: 50%;
    color: var(--bh-muted);
    background: transparent;
  }

  .auth-workspace__form :deep(.btn-primary) {
    width: 100%;
    min-height: 48px;
    border-radius: var(--bh-radius-pill);
  }

  .auth-workspace__form :deep(.login-form__toolbar) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }

  .auth-workspace__form :deep(.login-form__badge) {
    color: var(--bh-muted);
    font-size: var(--bh-text-xs);
  }

  .auth-workspace__form :deep(.auth-password-toggle svg) {
    display: block;
    width: 20px;
    height: 20px;
  }

  .auth-workspace :deep(:is(p, span, label, input, button)) {
    text-transform: none;
  }

  @media (max-width: 800px) {
    .auth-workspace__layout {
      grid-template-columns: 1fr;
      min-height: 0;
    }

    .auth-workspace__intro {
      gap: 24px;
    }

    .auth-workspace__copy h1 {
      font-size: 1.75rem;
    }

    .auth-workspace__copy p {
      margin-block-start: 12px;
      font-size: var(--bh-text-sm);
    }

    .auth-workspace__portal {
      display: none;
    }
  }
</style>
