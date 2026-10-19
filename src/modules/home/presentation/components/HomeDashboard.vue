<script setup lang="ts">
  import { computed, onMounted, onUnmounted, shallowRef, ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useUserStore } from '@/stores/user';
  import { DATA_MUTATION_SUCCEEDED_EVENT } from '@/base/Presentation/Controller/dataMutationEvent';
  import type { SidebarCountsPayload } from '@/shared/LayoutComponents/SubComponents/sidebar.config';
  import { getSidebarSections } from '@/shared/LayoutComponents/SubComponents/sidebar.config';
  import HomeController, { type HomeWorkspace } from '../controllers/home.controller';
  import { getHomeCards } from '../home.config';

  const props = defineProps<{ workspace: HomeWorkspace }>();
  const { locale } = useI18n();
  const userStore = useUserStore();
  const userName = computed(() => userStore.user?.name?.trim() ?? '');
  const isLoading = ref(true);
  const sidebarCounts = shallowRef<SidebarCountsPayload | null>(null);
  const workspaceSections = computed(() =>
    getSidebarSections()
      .map((section) => ({
        ...section,
        items: section.items.filter(
          (item) =>
            item.path && !item.disabled && (!item.roles || item.roles.includes(props.workspace)),
        ),
      }))
      .filter((section) => section.items.length),
  );
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
    <section class="dashboard-home__modules" :aria-label="$t('main_navigation')">
      <h2>{{ $t('main_navigation') }}</h2>
      <div class="dashboard-home__module-grid">
        <article
          v-for="section in workspaceSections"
          :key="section.key"
          :data-group="section.key"
          class="workspace-directory"
        >
          <header>
            <component :is="section.icon" aria-hidden="true" />
            <h3>{{ $t(section.labelKey) }}</h3>
          </header>
          <nav :aria-label="$t(section.labelKey)">
            <RouterLink
              v-for="item in section.items"
              :key="`${item.labelKey}-${item.path}`"
              :to="`/${workspace}${item.path}`"
            >
              <span>{{ $t(item.labelKey) }}</span
              ><i class="pi pi-arrow-up-right" aria-hidden="true" />
            </RouterLink>
          </nav>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
  :global(.dashboard-shell .main-content:has(.dashboard-home) > .feature-header-container) {
    display: none;
  }

  .dashboard-home {
    display: grid;
    gap: var(--bh-space-6);
    padding-block: var(--bh-space-4);
  }

  .dashboard-home__hero,
  .dashboard-home__admin-hero {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 32px;
    padding-block: 12px;
  }

  .dashboard-home__welcome,
  .dashboard-home__admin-copy {
    min-width: 0;
  }

  h1 {
    margin: 0;
    color: var(--bh-text);
    font-size: var(--bh-text-page);
    font-weight: 600;
    line-height: 1.3;
    text-transform: none;
  }

  .dashboard-home__name {
    margin-inline-start: 8px;
  }

  .dashboard-home__welcome p,
  .dashboard-home__admin-copy p {
    max-width: 65ch;
    margin-block: 10px 0;
    color: var(--bh-muted);
    font-size: var(--bh-text-sm);
    line-height: 1.6;
  }

  .dashboard-home__journey {
    min-width: 260px;
    padding: 20px 24px;
    border-radius: var(--bh-radius-card);
    background: var(--bh-surface-secondary);
  }

  .dashboard-home__journey strong {
    font-size: var(--bh-text-sm);
    font-weight: 500;
    color: var(--bh-text);
  }

  .dashboard-home__journey p {
    margin: 6px 0 0;
    font-size: var(--bh-text-xs);
    color: var(--bh-muted);
  }

  .dashboard-home__steps {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    margin-block-start: 12px;
    color: var(--bh-blue-ink);
    font-size: var(--bh-text-sm);
  }

  :global([dir='ltr'] .dashboard-home__steps .pi) {
    transform: rotate(180deg);
  }

  .dashboard-home__admin-name {
    display: inline-block;
    margin-block-start: 12px;
    color: var(--bh-blue-ink);
  }

  .dashboard-home__counts {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
    padding: 20px;
    border-radius: var(--bh-radius-panel);
    background: var(--bh-surface-secondary);
  }

  .dashboard-home__card {
    position: relative;
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 12px;
    min-width: 0;
    padding: 24px;
    border-radius: var(--bh-radius-card);
    background: var(--bh-surface);
    color: var(--bh-text);
    text-decoration: none;
    transition: background var(--bh-motion-fast);
  }

  .dashboard-home__card:hover {
    background: var(--bh-surface-raised);
  }

  .dashboard-home__card-icon {
    display: grid;
    width: 40px;
    height: 40px;
    place-items: center;
    border-radius: 50%;
    color: var(--bh-blue-ink);
    background: var(--bh-blue-soft);
  }

  .dashboard-home__card-count {
    grid-column: 1;
    grid-row: 2;
    font-size: 2.25rem;
    font-variant-numeric: tabular-nums;
    line-height: 1.2;
  }

  .dashboard-home__card h2 {
    grid-column: 1 / -1;
    margin: 0;
    color: var(--bh-muted);
    font-size: var(--bh-text-sm);
    font-weight: 400;
  }

  .dashboard-home__card-arrow {
    position: absolute;
    inset-inline-end: 22px;
    inset-block-start: 22px;
    color: var(--bh-muted);
  }

  .dashboard-home__modules > h2 {
    margin: 8px 0 18px;
    font-size: var(--bh-text-lg);
    font-weight: 600;
    color: var(--bh-text);
  }

  .dashboard-home__module-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    align-items: start;
    gap: 20px;
  }

  .workspace-directory {
    min-width: 0;
    padding: 24px;
    border-radius: var(--bh-radius-card);
    background: var(--bh-surface);
  }

  .workspace-directory header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-block-end: 16px;
    color: var(--bh-blue-ink);
  }

  .workspace-directory header > :first-child {
    width: 20px;
    height: 20px;
    font-size: 20px;
  }

  .workspace-directory h3 {
    margin: 0;
    color: var(--bh-text);
    font-size: var(--bh-text-md);
    font-weight: 500;
  }

  .workspace-directory nav {
    display: grid;
  }

  .workspace-directory a {
    display: flex;
    min-height: 44px;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding-block: 10px;
    border-block-end: 1px solid var(--bh-line);
    color: var(--bh-muted);
    font-size: var(--bh-text-sm);
    text-decoration: none;
  }

  .workspace-directory a:last-child {
    border: 0;
  }

  .workspace-directory a:hover {
    color: var(--bh-blue-ink);
  }

  .workspace-directory a i {
    flex-shrink: 0;
    font-size: 12px;
  }

  :global([dir='rtl'] .workspace-directory a i) {
    transform: scaleX(-1);
  }

  .workspace-directory[data-group='sys-config'] {
    grid-column: 1 / -1;
  }

  .workspace-directory[data-group='sys-config'] nav {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0 24px;
  }

  @media (max-width: 1100px) {
    .dashboard-home__module-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 680px) {
    .dashboard-home__hero,
    .dashboard-home__admin-hero {
      flex-direction: column;
      align-items: stretch;
      gap: 20px;
    }

    .dashboard-home__journey {
      min-width: 0;
    }

    .dashboard-home__counts {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
      padding: 12px;
    }

    .dashboard-home__card {
      padding: 18px;
    }

    .dashboard-home__card-count {
      font-size: 1.75rem;
    }

    .dashboard-home__module-grid {
      grid-template-columns: 1fr;
    }

    .workspace-directory[data-group='sys-config'] nav {
      grid-template-columns: 1fr;
    }
  }
</style>
