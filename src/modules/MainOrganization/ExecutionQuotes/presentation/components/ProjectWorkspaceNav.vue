<script setup lang="ts">
  import { computed } from 'vue';
  import { useRoute } from 'vue-router';
  import { quotePath, schedulePath } from '../../Schedule/presentation/schedule.routes';
  import { siteTeamPath } from '../../SiteTeam/presentation/site-team.routes';
  import { workItemsPath } from '../../WorkItems/presentation/work-items.routes';
  const props = defineProps<{ quoteId: number; active: 'schedule' | 'site-team' | 'work-items' }>();
  const route = useRoute();
  const validQuote = computed(() => Number.isInteger(props.quoteId) && props.quoteId > 0);
</script>
<template>
  <nav v-if="validQuote" class="workspace-nav" :aria-label="$t('project_workspace.navigation')">
    <RouterLink :to="quotePath(route.path, quoteId)" class="workspace-nav__home">
      <i class="pi pi-th-large" aria-hidden="true"></i>{{ $t('project_workspace.apps') }}
    </RouterLink>
    <span class="workspace-nav__divider" aria-hidden="true"></span>
    <RouterLink
      :to="schedulePath(route.path, quoteId)"
      :aria-current="active === 'schedule' ? 'page' : undefined"
    >
      <i class="pi pi-calendar" aria-hidden="true"></i>{{ $t('schedule.title') }}
    </RouterLink>
    <RouterLink
      :to="siteTeamPath(route.path, quoteId)"
      :aria-current="active === 'site-team' ? 'page' : undefined"
    >
      <i class="pi pi-map-marker" aria-hidden="true"></i>{{ $t('site_team.title') }}
    </RouterLink>
    <RouterLink
      :to="workItemsPath(route.path, quoteId)"
      :aria-current="active === 'work-items' ? 'page' : undefined"
      ><i class="pi pi-list-check" aria-hidden="true"></i>{{ $t('work_items.title') }}</RouterLink
    >
  </nav>
</template>
<style scoped lang="scss">
  .workspace-nav {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.4rem;
    padding: 0.5rem;
    border: 1px solid var(--border-weak);
    border-radius: 14px;
    background: var(--bg-card);
  }

  .workspace-nav a {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.75rem 1rem;
    border-radius: 10px;
    color: var(--subtitle-color);
    font-size: 0.85rem;
    font-weight: 600;
    text-decoration: none;
    transition:
      background-color 180ms ease,
      color 180ms ease;
  }

  .workspace-nav a:hover {
    background: var(--bg-section);
    color: var(--title-card-color);
  }

  .workspace-nav a[aria-current='page'] {
    background: var(--PrimaryColor-alpha-8);
    color: var(--title-card-color);
  }

  .workspace-nav a:focus-visible {
    outline: 2px solid var(--PrimaryColor);
    outline-offset: 2px;
  }

  .workspace-nav__divider {
    width: 1px;
    height: 1.5rem;
    background: var(--border-weak);
  }

  @media (max-width: 600px) {
    .workspace-nav__home {
      width: 100%;
    }

    .workspace-nav__divider {
      display: none;
    }

    .workspace-nav a {
      padding: 0.65rem 0.8rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .workspace-nav a {
      transition: none;
    }
  }
</style>
