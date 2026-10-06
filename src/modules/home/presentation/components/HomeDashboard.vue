<script setup lang="ts">
  import { computed, onMounted, onUnmounted, shallowRef, ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useUserStore } from '@/stores/user';
  import { DATA_MUTATION_SUCCEEDED_EVENT } from '@/base/Presentation/Controller/dataMutationEvent';
  import type { SidebarCountsPayload } from '@/shared/LayoutComponents/SubComponents/sidebar.config';
  import architectureImage from '@/assets/images/dashboard-home-architecture.png';
  import adminArchitectureImage from '@/assets/images/dashboard-admin-architecture.png';
  import HomeController, { type HomeWorkspace } from '../controllers/home.controller';
  import { getHomeCards } from '../home.config';

  const props = defineProps<{ workspace: HomeWorkspace }>();
  const { locale } = useI18n();
  const userStore = useUserStore();
  const userName = computed(() => userStore.user?.name?.trim() ?? '');
  const isLoading = ref(true);
  const sidebarCounts = shallowRef<SidebarCountsPayload | null>(null);
  const cards = computed(() => getHomeCards(props.workspace, sidebarCounts.value));
  const numberFormatter = computed(
    () => new Intl.NumberFormat(locale.value.startsWith('ar') ? 'ar-EG' : 'en-US'),
  );
  const formatCount = (value: number | null): string =>
    value === null ? '—' : numberFormatter.value.format(value);

  let isMounted = true;

  const loadCounts = async (): Promise<void> => {
    let counts: SidebarCountsPayload | null = null;
    try {
      counts = await HomeController.getInstance().fetchCounts(props.workspace);
    } catch {
      counts = null;
    }
    if (!isMounted) return;
    sidebarCounts.value = counts;
    isLoading.value = false;
  };

  const refreshCountsAfterMutation = (): void => {
    void loadCounts();
  };

  onMounted(() => {
    void loadCounts();
    window.addEventListener(DATA_MUTATION_SUCCEEDED_EVENT, refreshCountsAfterMutation);
  });

  onUnmounted(() => {
    isMounted = false;
    window.removeEventListener(DATA_MUTATION_SUCCEEDED_EVENT, refreshCountsAfterMutation);
  });
</script>

<template>
  <div class="dashboard-home">
    <section
      v-if="workspace === 'organization'"
      class="dashboard-home__hero"
      :aria-label="$t('home_dashboard.hero_label')"
    >
      <img class="dashboard-home__art" :src="architectureImage" alt="" />
      <div class="dashboard-home__welcome">
        <h1>
          {{ $t('home_dashboard.welcome')
          }}<span v-if="userName" class="dashboard-home__name">{{ userName }}</span>
        </h1>
        <p>{{ $t('home_dashboard.organization_intro') }}</p>
      </div>
      <div class="dashboard-home__journey">
        <strong>{{ $t('home_dashboard.journey_title') }}</strong>
        <p>{{ $t('home_dashboard.journey_description') }}</p>
        <div class="dashboard-home__steps" :aria-label="$t('home_dashboard.journey_steps')">
          <span>{{ $t('home_dashboard.idea') }}</span>
          <i class="pi pi-arrow-left" aria-hidden="true" />
          <span>{{ $t('home_dashboard.estimate') }}</span>
          <i class="pi pi-arrow-left" aria-hidden="true" />
          <span>{{ $t('home_dashboard.project') }}</span>
        </div>
      </div>
    </section>

    <section
      v-else
      class="dashboard-home__admin-hero"
      :aria-label="$t('home_dashboard.admin_hero_label')"
    >
      <div class="dashboard-home__admin-copy">
        <h1>{{ $t('home_dashboard.admin_title') }}</h1>
        <p>{{ $t('home_dashboard.admin_description') }}</p>
        <span v-if="userName" class="dashboard-home__admin-name">{{ userName }}</span>
      </div>
      <div class="dashboard-home__admin-art">
        <img :src="adminArchitectureImage" alt="" />
      </div>
    </section>

    <section
      class="dashboard-home__counts"
      :aria-label="$t('home_dashboard.overview')"
      :aria-busy="isLoading"
    >
      <RouterLink v-for="card in cards" :key="card.key" :to="card.to" class="dashboard-home__card">
        <span class="dashboard-home__card-icon"><component :is="card.icon" /></span>
        <span
          class="dashboard-home__card-count"
          :title="
            card.count === null && !isLoading && workspace === 'organization'
              ? $t('home_dashboard.unavailable')
              : undefined
          "
        >
          {{ isLoading && workspace === 'organization' ? '—' : formatCount(card.count) }}
        </span>
        <h2>{{ $t(card.labelKey) }}</h2>
        <span v-if="workspace === 'admin'" class="dashboard-home__card-arrow" aria-hidden="true">
          <i class="pi pi-arrow-right" />
        </span>
      </RouterLink>
    </section>
  </div>
</template>

<style scoped lang="scss">
  :global(.dashboard-shell .main-content:has(.dashboard-home) > .feature-header-container) {
    display: none;
  }

  .dashboard-home {
    max-width: 1500px;
    margin-inline: auto;
    padding-block: 18px 34px;
  }

  .dashboard-home__hero {
    position: relative;
    isolation: isolate;
    display: grid;
    grid-template-columns: minmax(190px, 1fr) minmax(200px, 1fr);
    gap: 32px;
    align-items: start;
    min-height: clamp(350px, 32vw, 485px);
    padding: clamp(28px, 3.2vw, 50px);
    overflow: hidden;
    border-radius: 16px;
    background: var(--quote-paper);
    box-shadow: 0 16px 42px color-mix(in sRGB, var(--quote-ink) 8%, transparent);
    animation: home-reveal 750ms cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  .dashboard-home__hero::after {
    position: absolute;
    inset-inline-start: 5%;
    inset-block-end: 25px;
    width: 24%;
    height: 1px;
    background: var(--quote-copper-border);
    content: '';
    opacity: 0.6;
    transform-origin: inline-start;
    animation: blueprint-line 7s ease-in-out infinite alternate;
  }

  .dashboard-home__art {
    position: absolute;
    z-index: -1;
    inset-block: 0;
    inset-inline-start: 12%;
    width: 76%;
    height: 100%;
    object-fit: cover;
    object-position: center 57%;
    mask-image: linear-gradient(
      to right,
      transparent,
      var(--quote-ink) 12%,
      var(--quote-ink) 88%,
      transparent
    );
  }

  .dashboard-home__welcome,
  .dashboard-home__journey {
    max-width: 260px;
    text-wrap: balance;
  }

  .dashboard-home__welcome {
    justify-self: start;
    text-align: start;
  }

  .dashboard-home__welcome h1 {
    margin: 0;
    color: var(--quote-ink);
    font-size: clamp(1.55rem, 2.4vw, 2.5rem);
    font-weight: 700;
    line-height: 1.26;
  }

  .dashboard-home__name {
    display: block;
    margin-block-start: 8px;
    overflow-wrap: anywhere;
  }

  .dashboard-home__welcome p,
  .dashboard-home__journey p {
    margin-block: 14px 0;
    color: var(--quote-muted);
    font-size: 0.98rem;
    line-height: 1.7;
  }

  .dashboard-home__journey {
    justify-self: end;
    text-align: start;
  }

  .dashboard-home__journey strong {
    display: block;
    max-width: 10ch;
    color: var(--quote-ink);
    font-size: clamp(1.45rem, 2.2vw, 2.1rem);
    font-weight: 600;
    line-height: 1.3;
  }

  .dashboard-home__steps {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    margin-block-start: 22px;
    color: var(--quote-copper-dark);
    font-size: 0.87rem;
    font-weight: 700;
  }

  .dashboard-home__steps .pi {
    font-size: 0.72rem;
  }

  :global([dir='ltr'] .dashboard-home__steps .pi) {
    transform: rotate(180deg);
  }

  .dashboard-home__counts {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: clamp(14px, 2vw, 24px);
    margin-block-start: 26px;
  }

  .dashboard-home__card {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    min-width: 0;
    min-height: 190px;
    padding: clamp(20px, 2.1vw, 30px);
    border: 1px solid var(--quote-line);
    border-radius: 15px;
    background: var(--quote-paper);
    color: inherit;
    text-decoration: none;
    animation: home-reveal 750ms 100ms cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  .dashboard-home__card:focus-visible {
    outline: 2px solid var(--quote-copper-dark);
    outline-offset: 3px;
  }

  .dashboard-home__card-icon {
    display: grid;
    width: 45px;
    height: 45px;
    place-items: center;
    border-radius: 12px;
    color: var(--quote-copper-dark);
    background: var(--quote-copper-soft);
    font-size: 1.2rem;
  }

  .dashboard-home__card-count {
    margin-block-start: 18px;
    color: var(--quote-ink);
    font-size: clamp(2rem, 2.8vw, 2.7rem);
    font-weight: 700;
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }

  .dashboard-home__card h2 {
    margin-block: 9px 0;
    color: var(--quote-ink);
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.4;
  }

  .dashboard-home__admin-hero {
    display: grid;
    grid-template-columns: minmax(300px, 1fr) minmax(0, 1.4fr);
    min-height: clamp(340px, 30vw, 465px);
    overflow: hidden;
    border-radius: 16px;
    background: var(--quote-paper);
    box-shadow: 0 16px 42px color-mix(in sRGB, var(--quote-ink) 8%, transparent);
    animation: home-reveal 750ms cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  .dashboard-home__admin-copy {
    z-index: 1;
    align-self: center;
    padding: clamp(28px, 3vw, 48px);
    text-align: start;
  }

  .dashboard-home__admin-copy h1 {
    max-width: 16ch;
    margin: 0;
    color: var(--quote-ink);
    font-size: clamp(2rem, 3vw, 3rem);
    font-weight: 700;
    line-height: 1.18;
    text-wrap: balance;
  }

  .dashboard-home__admin-copy p {
    max-width: 45ch;
    margin: 22px 0 0;
    color: var(--quote-muted);
    font-size: clamp(0.95rem, 1.15vw, 1.1rem);
    line-height: 1.75;
  }

  .dashboard-home__admin-name {
    display: inline-block;
    max-width: 100%;
    margin-block-start: 24px;
    padding-block-start: 14px;
    border-top: 1px solid var(--quote-copper-border);
    color: var(--quote-copper-dark);
    font-weight: 700;
    overflow-wrap: anywhere;
  }

  .dashboard-home__admin-art {
    position: relative;
    min-width: 0;
    overflow: hidden;
    background: var(--quote-canvas);
  }

  .dashboard-home__admin-art img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    transition: transform 700ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .dashboard-home__admin-art::after {
    position: absolute;
    inset-inline-start: 8%;
    inset-block-end: 12%;
    width: 42%;
    height: 1px;
    background: var(--quote-copper-border);
    content: '';
    transform-origin: inline-start;
    animation: admin-line-draw 1.7s ease-out both;
  }

  .dashboard-home__card-arrow {
    position: absolute;
    inset-block-start: clamp(20px, 2.1vw, 30px);
    inset-inline-end: clamp(20px, 2.1vw, 30px);
    display: grid;
    width: 34px;
    height: 34px;
    place-items: center;
    border-radius: 50%;
    color: var(--quote-copper-dark);
    background: var(--quote-copper-soft);
    font-size: 0.82rem;
  }

  :global([dir='rtl'] .dashboard-home__card-arrow i) {
    transform: rotate(180deg);
  }

  @media (hover: hover) {
    .dashboard-home__admin-hero:hover .dashboard-home__admin-art img {
      transform: scale(1.015);
    }
  }

  @keyframes home-reveal {
    from {
      opacity: 0.6;
      transform: translateY(8px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes blueprint-line {
    from {
      opacity: 0.35;
      transform: scaleX(0.75);
    }

    to {
      opacity: 0.7;
      transform: scaleX(1);
    }
  }

  @keyframes admin-line-draw {
    from {
      opacity: 0;
      transform: scaleX(0);
    }

    to {
      opacity: 0.65;
      transform: scaleX(1);
    }
  }

  @media (max-width: 1100px) {
    .dashboard-home__hero {
      min-height: 390px;
    }

    .dashboard-home__counts {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 680px) {
    .dashboard-home {
      padding-block-start: 12px;
    }

    .dashboard-home__hero {
      grid-template-columns: 1fr;
      gap: 14px;
      min-height: 540px;
      padding: 25px;
    }

    .dashboard-home__art {
      inset-block-start: 185px;
      inset-inline-start: 0;
      width: 100%;
      height: calc(100% - 185px);
      object-position: center bottom;
      mask-image: none;
    }

    .dashboard-home__welcome {
      max-width: 100%;
    }

    .dashboard-home__welcome p {
      max-width: 30ch;
    }

    .dashboard-home__journey {
      position: absolute;
      inset-inline: 20px;
      inset-block-end: 16px;
      max-width: none;
      padding: 12px 16px;
      border-radius: 10px;
      background: var(--quote-paper);
    }

    .dashboard-home__journey strong,
    .dashboard-home__journey p {
      display: none;
    }

    .dashboard-home__steps {
      margin-block-start: 0;
    }

    .dashboard-home__counts {
      gap: 12px;
      margin-block-start: 14px;
    }

    .dashboard-home__card {
      min-height: 158px;
      padding: 17px;
    }

    .dashboard-home__card-count {
      margin-block-start: 12px;
    }

    .dashboard-home__card h2 {
      font-size: 0.9rem;
    }

    .dashboard-home__card-arrow {
      inset-block-start: 17px;
      inset-inline-end: 17px;
    }

    .dashboard-home__admin-hero {
      grid-template-columns: 1fr;
    }

    .dashboard-home__admin-copy {
      padding: 28px 25px;
    }

    .dashboard-home__admin-copy h1 {
      max-width: 16ch;
    }

    .dashboard-home__admin-art {
      height: clamp(220px, 62vw, 330px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .dashboard-home__hero,
    .dashboard-home__hero::after,
    .dashboard-home__card,
    .dashboard-home__admin-hero,
    .dashboard-home__admin-art::after {
      animation: none;
    }

    .dashboard-home__admin-art img {
      transition: none;
    }
  }
</style>
