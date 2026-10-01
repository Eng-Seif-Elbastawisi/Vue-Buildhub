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
  <main class="auth-shell" :class="`auth-shell--${mode}`" :style="shellStyle">
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
              <strong>{{ $t('buildhub_os') }}</strong>
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
