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
  <!--------------------(show password an email)-->
  <div class="demo-credentials" role="note" aria-label="Demo login credentials">
    <div class="demo-credentials__header">
      <span class="demo-credentials__icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </span>

      <div class="demo-credentials__heading">
        <h3>Demo Credentials</h3>
        <p>Use these accounts to explore the system</p>
      </div>
    </div>

    <div class="demo-credentials__account">
      <span class="demo-credentials__label">Email</span>
      <code>employee@techlab.com</code>
      <span class="demo-credentials__hint"></span>
    </div>
    <div class="demo-credentials__account">
      <span class="demo-credentials__label">Password</span>
      <code>123123123</code>
      <span class="demo-credentials__hint"></span>
    </div>
  </div>

  <!-- --------------------------------------------- -->
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
  //---------------------------------(show password an email)

  .demo-credentials {
    width: min(100%, 1280px);
    margin: 0 auto 20px;
    padding: 20px 24px;
    border: 1px solid var(--bh-field-line);
    border-radius: var(--bh-radius-panel);
    background: var(--bh-surface);
    color: var(--bh-text);
    box-shadow: 0 4px 18px rgb(15 23 42 / 4%);
  }

  .demo-credentials__header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 18px;
  }

  .demo-credentials__icon {
    display: grid;
    width: 42px;
    height: 42px;
    flex-shrink: 0;
    place-items: center;
    border-radius: 12px;
    color: var(--bh-blue-ink);
    background: var(--bh-surface-secondary);
  }

  .demo-credentials__heading h3 {
    margin: 0;
    color: var(--bh-text);
    font-size: var(--bh-text-md);
    font-weight: 700;
  }

  .demo-credentials__heading p {
    margin: 4px 0 0;
    color: var(--bh-muted);
    font-size: var(--bh-text-sm);
    line-height: 1.5;
  }

  .demo-credentials__accounts {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .demo-credentials__account {
    display: flex;
    min-width: 0;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px 12px;
    padding: 14px 16px;
    border: 1px solid var(--bh-field-line);
    border-radius: var(--bh-radius-control);
    background: var(--bh-surface-raised);
  }

  .demo-credentials__label {
    width: 100%;
    color: var(--bh-muted);
    font-size: var(--bh-text-xs);
    font-weight: 600;
  }

  .demo-credentials__account code {
    overflow-wrap: anywhere;
    color: var(--bh-text);
    font-family: monospace;
    font-size: var(--bh-text-sm);
    font-weight: 600;
    user-select: all;
  }

  .demo-credentials__hint {
    margin-inline-start: auto;
    color: var(--bh-blue-ink);
    font-size: var(--bh-text-xs);
  }

  @media (max-width: 520px) {
    .demo-credentials {
      padding: 16px;
      grid-column: 1 / -1;
      margin-bottom: 0;
    }

    .demo-credentials__accounts {
      grid-template-columns: 1fr;
    }

    .demo-credentials__account {
      padding: 12px;
    }
  }
  //---------------------------------
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
