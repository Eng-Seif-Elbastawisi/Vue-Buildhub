<script setup lang="ts">
  import { computed } from 'vue';
  import villaBackground from '@/assets/images/ChatGPT Image Jul 1, 2026, 11_19_16 AM.png';
  import floorPlanBackground from '@/assets/images/ChatGPT Image Jul 1, 2026, 11_19_11 AM.png';

  type LoginMode = 'organization' | 'admin';

  type HeadlineContent = {
    firstAccent: string;
    firstRest: string;
    secondAccent: string;
  };

  type StatCard = {
    label: string;
    value: string;
    icon: 'project' | 'estimate' | 'alert' | 'invoice' | 'company' | 'roles' | 'settings' | 'audit';
  };

  const props = defineProps<{
    mode: LoginMode;
  }>();

  const loginModeConfig = {
    organization: {
      badge: 'auth_organization_badge',
      brandSubtitle: 'auth_organization_brand_subtitle',
      headline: {
        firstAccent: 'auth_organization_headline_first_accent',
        firstRest: 'auth_organization_headline_first_rest',
        secondAccent: 'auth_organization_headline_second_accent',
      },
      description: 'auth_organization_description',
      heroImage: `url("${villaBackground}")`,
      sideImage: `url("${floorPlanBackground}")`,
      cards: [
        { label: 'auth_organization_card_projects', value: '24', icon: 'project' },
        { label: 'auth_organization_card_estimates', value: '18', icon: 'estimate' },
        { label: 'auth_organization_card_alerts', value: '7', icon: 'alert' },
        { label: 'auth_organization_card_invoices', value: '12', icon: 'invoice' },
      ],
    },
    admin: {
      badge: 'auth_admin_badge',
      brandSubtitle: 'auth_admin_brand_subtitle',
      headline: {
        firstAccent: 'auth_admin_headline_first_accent',
        firstRest: 'auth_admin_headline_first_rest',
        secondAccent: 'auth_admin_headline_second_accent',
      },
      description: 'auth_admin_description',
      heroImage: 'none',
      sideImage: 'none',
      cards: [
        { label: 'auth_admin_card_companies', value: '01', icon: 'company' },
        { label: 'auth_admin_card_roles', value: '02', icon: 'roles' },
        { label: 'auth_admin_card_settings', value: '03', icon: 'settings' },
        { label: 'auth_admin_card_audit', value: '04', icon: 'audit' },
      ],
    },
  } satisfies Record<
    LoginMode,
    {
      badge: string;
      brandSubtitle: string;
      headline: HeadlineContent;
      description: string;
      heroImage: string;
      sideImage: string;
      cards: StatCard[];
    }
  >;

  const content = computed(() => loginModeConfig[props.mode]);
  const shellStyle = computed(() => ({
    '--auth-hero-image': content.value.heroImage,
    '--auth-side-image': content.value.sideImage,
  }));
</script>

<template>
  <main class="auth-shell" :class="`auth-shell--${mode}`" :style="shellStyle" dir="rtl">
    <div class="auth-shell__layout">
      <section class="auth-shell__hero" :aria-labelledby="`${mode}-login-title`">
        <div class="auth-shell__hero-image" aria-hidden="true"></div>
        <div class="auth-shell__hero-shade" aria-hidden="true"></div>
        <div class="auth-shell__blueprint" aria-hidden="true"></div>

        <div v-if="mode === 'admin'" class="auth-shell__command-visual" aria-hidden="true">
          <span class="auth-shell__command-ring auth-shell__command-ring--one"></span>
          <span class="auth-shell__command-ring auth-shell__command-ring--two"></span>
          <span class="auth-shell__command-node auth-shell__command-node--one"></span>
          <span class="auth-shell__command-node auth-shell__command-node--two"></span>
          <span class="auth-shell__command-node auth-shell__command-node--three"></span>
          <svg class="auth-shell__command-shield" viewBox="0 0 160 180">
            <path d="M80 14L136 36V82C136 121 113 154 80 169C47 154 24 121 24 82V36L80 14Z" />
            <path d="M56 88L72 104L106 66" />
          </svg>
        </div>

        <div class="auth-shell__hero-content">
          <header class="auth-shell__brand">
            <div class="auth-shell__brand-mark" aria-hidden="true">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div>
              <strong>BuildHub OS</strong>
              <p>{{ $t(content.brandSubtitle) }}</p>
            </div>
          </header>

          <div class="auth-shell__copy">
            <span class="auth-shell__badge">{{ $t(content.badge) }}</span>
            <h1 :id="`${mode}-login-title`">
              <span>
                <mark>{{ $t(content.headline.firstAccent) }}</mark>
                {{ $t(content.headline.firstRest) }}
              </span>
              <mark>{{ $t(content.headline.secondAccent) }}</mark>
            </h1>
            <p>{{ $t(content.description) }}</p>
          </div>

          <div class="auth-shell__stats" :aria-label="$t('auth_login_modules_label')">
            <article
              v-for="(card, index) in content.cards"
              :key="card.label"
              class="auth-shell__stat-card"
              :class="`auth-shell__stat-card--${index + 1}`"
            >
              <span
                class="auth-shell__stat-icon"
                :class="`auth-shell__stat-icon--${card.icon}`"
                aria-hidden="true"
              >
                <i></i>
              </span>
              <p>{{ $t(card.label) }}</p>
              <strong>{{ card.value }} <span aria-hidden="true">↗</span></strong>
            </article>
          </div>

          <article v-if="mode === 'admin'" class="auth-shell__admin-dashboard">
            <div class="auth-shell__admin-dashboard-head">
              <span>{{ $t('auth_visual_admin_title') }}</span>
              <strong>{{ $t('auth_visual_live_label') }}</strong>
            </div>
            <div class="auth-shell__admin-dashboard-grid">
              <span>{{ $t('auth_visual_admin_pipeline_label') }}</span>
              <i></i>
              <span>{{ $t('auth_visual_admin_progress_label') }}</span>
              <i></i>
              <span>{{ $t('auth_visual_admin_finance_label') }}</span>
              <i></i>
            </div>
          </article>
        </div>
      </section>

      <section class="auth-shell__side" :aria-label="$t('auth_login_form_label')">
        <div class="auth-shell__side-bg" aria-hidden="true"></div>
        <slot :mode="mode" :badge="$t(content.badge)" />
      </section>
    </div>
  </main>
</template>

<style scoped lang="scss">
  @use '../../../../styles/variables' as *;

  .auth-shell {
    --auth-dark: #101418;
    --auth-darker: #07090c;
    --auth-copper: #b87333;
    --auth-copper-2: #c47a35;
    --auth-copper-3: #da8a43;
    --auth-soft: #fff7ef;
    --auth-bg: #f7f2ec;
    --auth-panel: #fffaf4;
    --auth-ink: #16181d;
    --auth-muted: #68707c;
    --auth-border: #e6e1dc;
    --auth-admin: #07111d;
    --auth-admin-bg: #07090c;
    --auth-admin-panel: #101418;
    --auth-admin-card: rgba(16, 20, 24, 0.78);
    --auth-admin-text: #ffffff;
    --auth-admin-muted: #cbd5e1;
    --auth-admin-placeholder: rgba(255, 255, 255, 0.5);
    --auth-admin-border: rgba(230, 225, 220, 0.18);
    --auth-admin-border-strong: rgba(230, 225, 220, 0.22);
    --auth-admin-input-bg: rgba(255, 255, 255, 0.06);
    --auth-admin-accent-base: #c47a35;
    --auth-admin-accent: #c47a35;
    --auth-success: #9de7b7;
    --auth-white-06: rgba(255, 255, 255, 0.06);
    --auth-white-08: rgba(255, 255, 255, 0.08);
    --auth-white-10: rgba(255, 255, 255, 0.1);
    --auth-white-12: rgba(255, 255, 255, 0.12);
    --auth-white-16: rgba(255, 255, 255, 0.16);
    --auth-white-20: rgba(255, 255, 255, 0.2);
    --auth-white-70: rgba(255, 255, 255, 0.7);
    --auth-white-82: rgba(255, 255, 255, 0.82);
    --auth-black-08: rgba(7, 9, 12, 0.08);
    --auth-black-12: rgba(7, 9, 12, 0.12);
    --auth-black-18: rgba(7, 9, 12, 0.18);
    --auth-black-24: rgba(7, 9, 12, 0.24);
    --auth-black-36: rgba(7, 9, 12, 0.36);
    --auth-black-52: rgba(7, 9, 12, 0.52);
    --auth-copper-08: rgba(184, 115, 51, 0.08);
    --auth-copper-12: rgba(184, 115, 51, 0.12);
    --auth-copper-16: rgba(184, 115, 51, 0.16);
    --auth-copper-22: rgba(184, 115, 51, 0.22);
    --auth-copper-30: rgba(184, 115, 51, 0.3);
    --auth-copper-42: rgba(184, 115, 51, 0.42);
    --auth-copper-60: rgba(184, 115, 51, 0.6);
    --auth-admin-accent-08: rgba(184, 115, 51, 0.08);
    --auth-admin-accent-16: rgba(184, 115, 51, 0.16);
    --auth-admin-accent-30: rgba(184, 115, 51, 0.3);
    --auth-form-bg: rgba(255, 250, 244, 0.92);
    --auth-admin-form-bg: rgba(16, 20, 24, 0.78);
    --auth-input-bg: rgba(255, 255, 255, 0.72);
    --auth-support-bg: rgba(255, 255, 255, 0.48);
    --auth-ease: cubic-bezier(0.2, 0.8, 0.2, 1);

    min-height: 100vh;
    color: $StandardWhite;
    background: var(--auth-darker);
    direction: rtl;
    overflow-x: hidden;
    animation: auth-page-fade 700ms var(--auth-ease) both;
  }

  .auth-shell__layout {
    min-height: 100vh;
    display: grid;
    grid-template-columns: minmax(0, 1fr) clamp(750px, 38vw, 700px);
    grid-template-areas: 'visual form';
    align-items: stretch;
    direction: ltr;
  }

  .auth-shell__hero,
  .auth-shell__side {
    position: relative;
    min-width: 0;
    overflow: hidden;
  }

  .auth-shell__hero {
    grid-area: visual;
    direction: ltr;
    display: flex;
    align-items: center;
    justify-content: right;
    padding: clamp(30px, 4vw, 58px) clamp(46px, 6.4vw, 96px);
    isolation: isolate;
  }

  .auth-shell__hero-image,
  .auth-shell__hero-shade,
  .auth-shell__blueprint,
  .auth-shell__side-bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .auth-shell__hero-image {
    z-index: -4;
    background-image:
      linear-gradient(90deg, var(--auth-black-52), var(--auth-black-24) 52%, var(--auth-black-12)),
      var(--auth-hero-image);
    background-size: cover;
    background-position: center;
    transform: scale(1.03);
    animation: auth-hero-zoom 18s var(--auth-ease) infinite alternate;
  }

  .auth-shell__hero-shade {
    z-index: -3;
    background:
      radial-gradient(circle at 38% 24%, transparent 0 26%, var(--auth-black-18) 52%),
      linear-gradient(90deg, var(--auth-darker) 0%, var(--auth-black-52) 34%, transparent 72%);
  }

  .auth-shell__blueprint {
    z-index: -2;
    opacity: 0.48;
    background-image:
      linear-gradient(var(--auth-copper-16) 1px, transparent 1px),
      linear-gradient(90deg, var(--auth-copper-16) 1px, transparent 1px),
      linear-gradient(135deg, transparent 0 45%, var(--auth-copper-30) 45% 46%, transparent 46%),
      linear-gradient(45deg, transparent 0 54%, var(--auth-copper-22) 54% 55%, transparent 55%);
    background-size:
      72px 72px,
      72px 72px,
      260px 220px,
      280px 240px;
    mask-image: linear-gradient(90deg, transparent 0%, black 14%, black 64%, transparent 90%);
  }

  .auth-shell--admin .auth-shell__hero-image {
    background-image:
      radial-gradient(circle at 76% 22%, var(--auth-admin-accent-16), transparent 28%),
      radial-gradient(circle at 30% 68%, var(--auth-copper-16), transparent 30%),
      linear-gradient(
        135deg,
        var(--auth-admin-bg),
        var(--auth-admin-panel) 48%,
        var(--auth-admin-card)
      );
    background-size: cover, cover, cover;
    background-position: center;
  }

  .auth-shell--admin .auth-shell__hero-shade {
    background:
      linear-gradient(90deg, var(--auth-black-52), transparent 70%),
      repeating-linear-gradient(90deg, transparent 0 84px, var(--auth-admin-accent-08) 84px 85px),
      repeating-linear-gradient(0deg, transparent 0 72px, var(--auth-white-06) 72px 73px);
  }

  .auth-shell--admin .auth-shell__blueprint {
    opacity: 0.72;
    background-image:
      linear-gradient(var(--auth-admin-accent-08) 1px, transparent 1px),
      linear-gradient(90deg, var(--auth-admin-accent-08) 1px, transparent 1px),
      radial-gradient(circle, var(--auth-admin-accent-30) 0 2px, transparent 3px);
    background-size:
      64px 64px,
      64px 64px,
      180px 130px;
  }

  .auth-shell__hero-content {
    width: min(100%, 750px);
    direction: rtl;
    display: grid;
    gap: clamp(28px, 5vh, 48px);
    animation: auth-copy-in 760ms var(--auth-ease) both;
  }

  .auth-shell__brand {
    display: flex;
    align-items: center;
    justify-content: right;
    gap: 13px;
  }

  .auth-shell__brand-mark {
    width: 38px;
    height: 44px;
    position: relative;
    display: inline-flex;
    align-items: end;
    justify-content: center;
    gap: 4px;
    color: var(--auth-copper-3);
    filter: drop-shadow(0 10px 18px var(--auth-copper-22));
  }

  .auth-shell__brand-mark::before {
    content: '';
    position: absolute;
    inset: 3px 0 0;
    border: 2px solid currentColor;
    border-top: 0;
    border-radius: 4px 4px 2px 2px;
    clip-path: polygon(
      0 100%,
      0 30%,
      24% 30%,
      24% 12%,
      50% 0,
      76% 12%,
      76% 30%,
      100% 30%,
      100% 100%
    );
  }

  .auth-shell__brand-mark span {
    width: 4px;
    border-radius: 999px 999px 0 0;
    background: currentColor;
  }

  .auth-shell__brand-mark span:nth-child(1) {
    height: 17px;
  }

  .auth-shell__brand-mark span:nth-child(2) {
    height: 28px;
  }

  .auth-shell__brand-mark span:nth-child(3) {
    height: 22px;
  }

  .auth-shell__brand strong {
    display: block;
    color: $StandardWhite;
    font-family: 'Bold', var(--font-family);
    font-size: clamp(1.05rem, 1.35vw, 1.36rem);
    line-height: 1.05;
    text-align: start;
  }

  .auth-shell__brand p {
    margin: 5px 0 0;
    color: var(--auth-white-70);
    font-size: clamp(0.62rem, 0.8vw, 0.78rem);
    line-height: 1.2;
  }

  .auth-shell__copy {
    display: grid;
    justify-items: start;
    gap: 16px;
    text-align: start;
  }

  .auth-shell__badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 34px;
    padding: 0 18px;
    border: 1px solid var(--auth-copper-42);
    border-radius: 999px;
    color: var(--auth-copper-3);
    background: var(--auth-copper-12);
    box-shadow: 0 14px 30px var(--auth-black-18);
    font-size: 0.86rem;
    font-weight: 900;
  }
  // .auth-shell__badge h1{

  // }

  .auth-shell__copy h1 {
    display: grid;
    gap: 4px;
    margin: 0;
    color: $StandardWhite;
    font-family: 'Bold', var(--font-family);
    font-size: clamp(2.35rem, 2.1vw, 4.05rem);
    line-height: 1.18;
    letter-spacing: 0;
    text-shadow: 0 20px 40px var(--auth-black-36);
  }

  .auth-shell__copy h1 mark {
    color: var(--auth-copper-3);
    background: transparent;
  }

  .auth-shell--admin .auth-shell__copy h1 mark {
    color: var(--auth-admin-accent);
  }

  .auth-shell__copy p {
    max-width: 520px;
    margin: 0;
    color: var(--auth-white-82);
    font-size: clamp(0.98rem, 1.28vw, 1.18rem);
    line-height: 1.85;
  }

  .auth-shell__stats {
    width: min(100%, 560px);
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
  }

  .auth-shell__stat-card {
    min-height: 118px;
    display: grid;
    align-content: center;
    justify-items: center;
    gap: 9px;
    padding: 18px 12px;
    border: 1px solid var(--auth-white-16);
    border-radius: 10px;
    color: $StandardWhite;
    background: linear-gradient(145deg, var(--auth-white-12), var(--auth-white-06));
    box-shadow:
      0 20px 38px var(--auth-black-24),
      inset 0 1px 0 var(--auth-white-16);
    backdrop-filter: blur(18px);
    animation:
      auth-stat-in 640ms var(--auth-ease) both,
      auth-card-float 5s var(--auth-ease) infinite alternate;
  }

  .auth-shell__stat-card--2 {
    animation-delay: 90ms, 420ms;
  }

  .auth-shell__stat-card--3 {
    animation-delay: 180ms, 240ms;
  }

  .auth-shell__stat-card--4 {
    animation-delay: 270ms, 620ms;
  }

  .auth-shell__stat-icon {
    width: 28px;
    height: 28px;
    position: relative;
    display: grid;
    place-items: center;
    color: var(--auth-copper-3);
  }

  .auth-shell--admin .auth-shell__stat-icon {
    color: var(--auth-admin-accent);
  }

  .auth-shell__stat-icon::before,
  .auth-shell__stat-icon::after,
  .auth-shell__stat-icon i {
    content: '';
    position: absolute;
    border: 2px solid currentColor;
    border-radius: 4px;
  }

  .auth-shell__stat-icon::before {
    width: 18px;
    height: 22px;
  }

  .auth-shell__stat-icon::after {
    width: 9px;
    height: 2px;
    border-width: 0;
    border-radius: 0;
    background: currentColor;
    transform: translateY(-5px);
  }

  .auth-shell__stat-icon i {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    transform: translate(-8px, 8px);
  }

  .auth-shell__stat-icon--alert::before {
    width: 19px;
    height: 20px;
    border-radius: 50% 50% 7px 7px;
  }

  .auth-shell__stat-icon--alert::after {
    transform: translateY(11px);
  }

  .auth-shell__stat-icon--invoice::before {
    width: 22px;
    height: 17px;
    transform: translateY(3px);
  }

  .auth-shell__stat-icon--invoice i {
    width: 8px;
    height: 6px;
    border-radius: 2px;
    transform: translate(8px, -8px);
  }

  .auth-shell__stat-card p {
    min-height: 28px;
    margin: 0;
    color: var(--auth-white-82);
    font-size: clamp(0.72rem, 0.86vw, 0.82rem);
    line-height: 1.45;
    text-align: center;
  }

  .auth-shell__stat-card strong {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: $StandardWhite;
    font-size: clamp(1rem, 1.35vw, 1.22rem);
    font-weight: 900;
  }

  .auth-shell__stat-card strong span {
    color: var(--auth-success);
    font-size: 0.92rem;
  }

  .auth-shell__side {
    grid-area: form;
    direction: rtl;
    display: grid;
    place-items: center;
    padding: clamp(24px, 4vw, 56px) clamp(22px, 3.2vw, 48px);
    color: var(--auth-ink);
    isolation: isolate;
  }

  .auth-shell__side-bg {
    z-index: -2;
    background-image:
      linear-gradient(90deg, var(--auth-black-08), transparent 24%), var(--auth-side-image);
    background-size: cover;
    background-position: right;
  }

  .auth-shell__side::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background: linear-gradient(90deg, var(--auth-copper-12), transparent 44%);
  }

  .auth-shell--admin .auth-shell__side {
    color: var(--auth-admin-text);
    background:
      radial-gradient(circle at 70% 14%, var(--auth-admin-accent-16), transparent 32%),
      linear-gradient(
        145deg,
        var(--auth-admin-bg),
        var(--auth-admin-panel) 58%,
        var(--auth-admin-bg)
      );
  }

  .auth-shell--admin .auth-shell__side-bg {
    opacity: 0.72;
    background-image:
      linear-gradient(var(--auth-admin-accent-08) 1px, transparent 1px),
      linear-gradient(90deg, var(--auth-admin-accent-08) 1px, transparent 1px),
      radial-gradient(circle at 62% 34%, var(--auth-copper-16), transparent 30%);
    background-size:
      54px 54px,
      54px 54px,
      cover;
    background-position: center;
  }

  .auth-shell--admin .auth-shell__side::before {
    background:
      radial-gradient(circle at 18% 78%, var(--auth-admin-accent-08), transparent 32%),
      linear-gradient(90deg, var(--auth-black-24), transparent 54%);
  }

  .auth-shell__command-visual {
    position: absolute;
    inset: 8% 50% auto auto;
    width: min(40vw, 520px);
    aspect-ratio: 1;
    z-index: -1;
    opacity: 0.78;
  }

  .auth-shell__command-ring,
  .auth-shell__command-node {
    position: absolute;
    border-radius: 50%;
  }

  .auth-shell__command-ring {
    inset: 10%;
    border: 1px solid var(--auth-admin-accent-16);
    box-shadow:
      inset 0 0 50px var(--auth-admin-accent-08),
      0 0 42px var(--auth-admin-accent-08);
    animation: auth-command-pulse 5s var(--auth-ease) infinite;
  }

  .auth-shell__command-ring--two {
    inset: 25%;
    border-color: var(--auth-copper-22);
    animation-delay: 900ms;
  }

  .auth-shell__command-node {
    width: 12px;
    height: 12px;
    background: var(--auth-admin-accent);
    box-shadow: 0 0 24px var(--auth-admin-accent-30);
  }

  .auth-shell__command-node--one {
    top: 23%;
    left: 28%;
  }

  .auth-shell__command-node--two {
    top: 52%;
    right: 16%;
  }

  .auth-shell__command-node--three {
    bottom: 20%;
    left: 42%;
    background: var(--auth-copper-3);
  }

  .auth-shell__command-shield {
    position: absolute;
    inset: 31% auto auto 35%;
    width: 30%;
    fill: none;
    stroke: var(--auth-admin-accent);
    stroke-width: 5;
    stroke-linecap: round;
    stroke-linejoin: round;
    filter: drop-shadow(0 0 22px var(--auth-admin-accent-30));
  }

  .auth-shell__admin-dashboard {
    width: min(100%, 420px);
    display: grid;
    gap: 12px;
    padding: 16px;
    border: 1px solid var(--auth-admin-border);
    border-radius: 18px;
    background: linear-gradient(145deg, var(--auth-white-08), var(--auth-white-06));
    box-shadow: 0 20px 40px var(--auth-black-24);
    backdrop-filter: blur(18px);
    animation: auth-stat-in 680ms var(--auth-ease) both 260ms;
  }

  .auth-shell__admin-dashboard-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    color: var(--auth-admin-text);
    font-weight: 900;
  }

  .auth-shell__admin-dashboard-head strong {
    padding: 4px 9px;
    border: 1px solid var(--auth-admin-accent-16);
    border-radius: 999px;
    color: var(--auth-admin-accent);
    background: var(--auth-admin-accent-08);
    font-size: 0.7rem;
  }

  .auth-shell__admin-dashboard-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
    color: var(--auth-admin-muted);
    font-size: 0.78rem;
  }

  .auth-shell__admin-dashboard-grid i {
    height: 6px;
    border-radius: 999px;
    background:
      linear-gradient(90deg, var(--auth-admin-accent), var(--auth-copper)) 0 0 / 72% 100% no-repeat,
      var(--auth-white-08);
    animation: auth-node-pulse 2.8s var(--auth-ease) infinite;
  }

  :deep(.login-form) {
    width: min(100%, 480px);
    display: grid;
    gap: 30px;
    padding: clamp(24px, 3vw, 34px);
    border: 1px solid var(--auth-white-70);
    border-radius: 18px;
    color: var(--auth-ink);
    background: var(--auth-form-bg);
    box-shadow:
      0 30px 70px var(--auth-black-18),
      inset 0 1px 0 var(--auth-white-82);
    backdrop-filter: blur(18px);
    animation: auth-form-in 780ms var(--auth-ease) both 120ms;
  }

  .auth-shell--admin :deep(.login-form) {
    border-color: var(--auth-admin-border);
    border-radius: 28px;
    color: var(--auth-admin-text);
    background: var(--auth-admin-form-bg);
    box-shadow:
      0 30px 80px var(--auth-black-52),
      0 0 44px var(--auth-admin-accent-08),
      inset 0 1px 0 var(--auth-white-10);
  }

  :deep(.lang-switcher) {
    display: none;
  }

  :deep(.login-form__toolbar) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
  }

  :deep(.login-form__badge) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 26px;
    padding: 0 13px;
    border: 1px solid var(--auth-copper-16);
    border-radius: 999px;
    color: var(--auth-copper);
    background: var(--auth-copper-08);
    font-size: 0.76rem;
    font-weight: 900;
    white-space: nowrap;
  }

  .auth-shell--admin :deep(.login-form__badge) {
    border-color: var(--auth-admin-accent-16);
    color: var(--auth-admin-accent);
    background: var(--auth-admin-accent-08);
  }

  :deep(.login-form__language) {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    border: 0;
    padding: 0;
    color: var(--auth-muted);
    background: transparent;
    font-size: 0.75rem;
    font-weight: 800;
    cursor: pointer;
  }

  .auth-shell--admin :deep(.login-form__language) {
    color: var(--auth-admin-muted);
  }

  :deep(.title) {
    display: grid;
    gap: 8px;
    margin-block: 6px 2px;
    text-align: center;
  }

  :deep(.title h2) {
    margin: 0;
    color: var(--auth-ink);
    font-family: 'Bold', var(--font-family);
    font-size: clamp(1.42rem, 1.6vw, 1.78rem);
    line-height: 1.25;
    letter-spacing: 0;
  }

  .auth-shell--admin :deep(.title h2) {
    color: var(--auth-admin-text);
  }

  :deep(.title p) {
    margin: 0;
    color: var(--auth-muted);
    font-size: 0.86rem;
    line-height: 1.65;
  }

  .auth-shell--admin :deep(.title p) {
    color: var(--auth-admin-muted);
  }

  :deep(.inputs) {
    display: grid;
    gap: 14px;
  }

  :deep(.input-wrapper) {
    // display: grid;
    gap: 7px;
    padding: 0;
    text-align: start;
  }

  :deep(.input-wrapper label) {
    color: var(--auth-ink);
    font-size: 0.76rem;
    font-weight: 900;
  }

  .auth-shell--admin :deep(.input-wrapper label) {
    color: var(--auth-admin-text);
  }

  :deep(.auth-input-wrap) {
    position: relative;
    width: 100%;
  }

  :deep(.auth-input-wrap input) {
    width: 100%;
    height: 52px;
    padding: 0 16px;
    border: 1px solid var(--auth-border);
    border-radius: 14px;
    color: var(--auth-ink) !important;
    background: var(--auth-input-bg) !important;
    box-shadow: inset 0 1px 0 var(--auth-white-70);
    caret-color: var(--auth-copper);
    transition:
      border-color 180ms var(--auth-ease),
      box-shadow 180ms var(--auth-ease),
      background-color 180ms var(--auth-ease);
    -webkit-text-fill-color: var(--auth-ink) !important;
  }

  :deep(.auth-input-wrap input::placeholder) {
    color: var(--auth-muted);
    opacity: 0.74;
  }

  .auth-shell--admin :deep(.auth-input-wrap input) {
    border-color: var(--auth-admin-border-strong);
    color: var(--auth-admin-text) !important;
    background: var(--auth-admin-input-bg) !important;
    -webkit-text-fill-color: var(--auth-admin-text) !important;
  }

  .auth-shell--admin :deep(.auth-input-wrap input::placeholder) {
    color: var(--auth-admin-placeholder);
  }

  :deep(.auth-input-wrap input:focus) {
    outline: none;
    border-color: var(--auth-copper);
    background: $StandardWhite !important;
    box-shadow:
      0 0 0 4px var(--auth-copper-12),
      0 12px 26px var(--auth-black-08);
  }

  .auth-shell--admin :deep(.auth-input-wrap input:focus) {
    border-color: var(--auth-admin-accent);
    background: var(--auth-admin-input-bg) !important;
    box-shadow:
      0 0 0 4px var(--auth-admin-accent-16),
      0 12px 28px var(--auth-black-24);
  }

  :deep(.auth-input-wrap--password input) {
    padding-left: 54px;
  }

  :deep(.auth-password-toggle) {
    position: absolute;
    top: 50%;
    left: 7px;
    width: 36px;
    height: 36px;
    display: grid;
    place-items: center;
    border: 0;
    border-radius: 10px;
    padding: 0;
    color: var(--auth-muted);
    background: transparent;
    cursor: pointer;
    transform: translateY(-50%);
    transition:
      background-color 180ms var(--auth-ease),
      color 180ms var(--auth-ease),
      transform 180ms var(--auth-ease);
  }

  :deep(.auth-password-toggle:hover) {
    color: var(--auth-copper);
    background: var(--auth-copper-08);
    transform: translateY(-50%) scale(1.04);
  }

  .auth-shell--admin :deep(.auth-password-toggle) {
    color: var(--auth-admin-muted);
  }

  .auth-shell--admin :deep(.auth-password-toggle:hover) {
    color: var(--auth-admin-accent);
    background: var(--auth-admin-accent-08);
  }

  :deep(.icon-eye) {
    width: 19px;
    height: 19px;
    display: block;
  }

  :deep(.login-form__meta) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-block-start: -2px;
    font-size: 0.78rem;
  }

  :deep(.login-form__remember) {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    color: var(--auth-muted);
    cursor: pointer;
  }

  .auth-shell--admin :deep(.login-form__remember) {
    color: var(--auth-admin-muted);
  }

  :deep(.login-form__remember input) {
    width: 14px;
    height: 14px;
    accent-color: var(--auth-copper);
  }

  .auth-shell--admin :deep(.login-form__remember input) {
    accent-color: var(--auth-admin-accent);
  }

  :deep(.login-form__link) {
    border: 0;
    padding: 0;
    color: var(--auth-copper);
    background: transparent;
    font: inherit;
    font-weight: 900;
    cursor: pointer;
  }

  .auth-shell--admin :deep(.login-form__link) {
    color: var(--auth-admin-accent);
  }

  :deep(.btn.btn-primary) {
    position: relative;
    width: 100%;
    min-height: 50px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 0;
    border-radius: 12px;
    color: $StandardWhite;
    background: linear-gradient(135deg, var(--auth-copper-3), var(--auth-copper));
    box-shadow: 0 16px 30px var(--auth-copper-30);
    font-weight: 900;
    cursor: pointer;
    overflow: hidden;
    transition:
      box-shadow 220ms var(--auth-ease),
      transform 220ms var(--auth-ease);
  }

  .auth-shell--admin :deep(.btn.btn-primary) {
    background: linear-gradient(135deg, var(--auth-admin-accent), var(--auth-copper));
    box-shadow: 0 18px 38px var(--auth-admin-accent-16);
  }

  :deep(.btn.btn-primary::before) {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(110deg, transparent, var(--auth-white-20), transparent);
    transform: translateX(110%);
    transition: transform 520ms var(--auth-ease);
  }

  :deep(.btn.btn-primary:hover) {
    box-shadow: 0 20px 40px var(--auth-copper-42);
    transform: translateY(-2px);
  }

  :deep(.btn.btn-primary:hover::before) {
    transform: translateX(-110%);
  }

  :deep(.disabled) {
    cursor: not-allowed;
    opacity: 0.72;
    pointer-events: none;
  }

  :deep(.login-form__divider) {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 12px;
    color: var(--auth-muted);
    font-size: 0.78rem;
  }

  :deep(.login-form__divider::before),
  :deep(.login-form__divider::after) {
    content: '';
    height: 1px;
    background: var(--auth-border);
  }

  .auth-shell--admin :deep(.login-form__divider) {
    color: var(--auth-admin-muted);
  }

  .auth-shell--admin :deep(.login-form__divider::before),
  .auth-shell--admin :deep(.login-form__divider::after) {
    background: var(--auth-admin-border);
  }

  :deep(.login-form__support) {
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: 1px solid var(--auth-border);
    border-radius: 10px;
    color: var(--auth-ink);
    background: var(--auth-support-bg);
    font-weight: 900;
    cursor: pointer;
    transition:
      border-color 180ms var(--auth-ease),
      background-color 180ms var(--auth-ease),
      transform 180ms var(--auth-ease);
  }

  :deep(.login-form__support:hover) {
    border-color: var(--auth-copper-42);
    background: $StandardWhite;
    transform: translateY(-1px);
  }

  .auth-shell--admin :deep(.login-form__support) {
    border-color: var(--auth-admin-border);
    color: var(--auth-admin-text);
    background: var(--auth-white-08);
  }

  .auth-shell--admin :deep(.login-form__support:hover) {
    border-color: var(--auth-admin-accent-30);
    background: var(--auth-admin-accent-08);
  }

  @media (max-width: 1180px) {
    .auth-shell__layout {
      grid-template-columns: minmax(0, 1fr) clamp(440px, 42vw, 520px);
      grid-template-areas: 'visual form';
    }

    .auth-shell__hero {
      padding-inline: clamp(30px, 4.2vw, 56px);
    }

    .auth-shell__copy h1 {
      font-size: clamp(2rem, 3.6vw, 3.1rem);
    }

    .auth-shell__stats {
      gap: 10px;
    }

    .auth-shell__stat-card {
      min-height: 104px;
      padding: 14px 8px;
    }
  }

  @media (max-width: 900px) {
    .auth-shell__layout {
      // min-height: 100vh;
      min-height: 42vh;
      grid-template-columns: 1fr;
      grid-template-areas:
        'visual'
        'form';
    }

    .auth-shell__hero {
      display: none;
      min-height: 430px;
      padding: 24px;
      align-items: end;
    }

    .auth-shell__hero-content {
      width: min(100%, 620px);
      gap: 22px;
    }

    .auth-shell__copy h1 {
      font-size: clamp(1.8rem, 7vw, 2.7rem);
    }

    .auth-shell__copy p {
      max-width: 480px;
    }

    .auth-shell__stats {
      grid-template-columns: repeat(4, minmax(0, 1fr));
      width: 100%;
      gap: 8px;
    }

    .auth-shell__stat-card {
      min-height: 94px;
      border-radius: 9px;
    }

    .auth-shell__side {
      min-height: auto;
      padding: 0 18px 28px;
      margin-block-start: -42px;
    }

    :deep(.login-form) {
      width: min(100%, 460px);
      margin: 2rem 0;
    }

    .auth-shell__side-bg {
      opacity: 0.68;
    }

    .auth-shell--admin .auth-shell__side-bg {
      opacity: 0.5;
    }
  }

  @media (max-width: 600px) {
    .auth-shell__hero {
      min-height: 380px;
      padding: 18px 16px 58px;
    }

    .auth-shell__brand {
      justify-content: flex-start;
    }

    .auth-shell__brand-mark {
      width: 32px;
      height: 38px;
    }

    .auth-shell__copy {
      gap: 12px;
    }

    .auth-shell__badge {
      min-height: 30px;
      padding-inline: 14px;
      font-size: 0.78rem;
    }

    .auth-shell__copy h1 {
      max-width: 360px;
      font-size: clamp(1.72rem, 8vw, 2rem);
    }

    .auth-shell__copy p {
      font-size: 0.9rem;
      line-height: 1.7;
    }

    .auth-shell__stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .auth-shell__stat-card:nth-child(n + 3) {
      display: none;
    }

    .auth-shell__side {
      padding: 0 14px 20px;
    }

    :deep(.login-form) {
      gap: 16px;
      padding: 22px 16px;
      border-radius: 16px;
    }

    :deep(.login-form__meta) {
      align-items: flex-start;
      flex-direction: column;
      gap: 8px;
    }
  }

  @keyframes auth-page-fade {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }

  @keyframes auth-hero-zoom {
    from {
      transform: scale(1.03);
    }

    to {
      transform: scale(1.08);
    }
  }

  @keyframes auth-copy-in {
    from {
      opacity: 0;
      transform: translateY(22px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes auth-stat-in {
    from {
      opacity: 0;
      transform: translateY(18px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes auth-card-float {
    from {
      transform: translateY(0);
    }

    to {
      transform: translateY(-5px);
    }
  }

  @keyframes auth-form-in {
    from {
      opacity: 0;
      transform: translateX(-26px);
    }

    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes auth-command-pulse {
    0%,
    100% {
      transform: scale(0.98);
      opacity: 0.58;
    }

    50% {
      transform: scale(1.03);
      opacity: 1;
    }
  }

  @keyframes auth-node-pulse {
    0%,
    100% {
      opacity: 0.7;
      transform: scaleX(0.94);
      transform-origin: right center;
    }

    50% {
      opacity: 1;
      transform: scaleX(1);
      transform-origin: right center;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .auth-shell,
    .auth-shell *,
    .auth-shell *::before,
    .auth-shell *::after {
      animation-duration: 1ms !important;
      animation-iteration-count: 1 !important;
      scroll-behavior: auto !important;
      transition-duration: 1ms !important;
    }
  }
</style>
