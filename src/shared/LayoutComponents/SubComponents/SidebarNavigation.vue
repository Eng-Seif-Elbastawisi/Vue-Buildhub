<script setup lang="ts">
  import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { storeToRefs } from 'pinia';

  import BuildHubLogo from '@/assets/images/BuildHubLogo.jpg';

  import IconLogout from '@/shared/icons/IconLogout.vue';

  import { useUserStore } from '@/stores/user';
  import { useSystemIdentityTheme } from '@/modules/shared/SystemIdentity/presentation/composables/useSystemIdentityTheme';
  import { DATA_MUTATION_SUCCEEDED_EVENT } from '@/base/Presentation/Controller/dataMutationEvent';
  import SidebarCountsApiService from './sidebar.counts.api-service';
  import { UserType } from '@/modules/auth/core/constants/userType.enum';
  import {
    getSidebarSections,
    getSidebarSectionsWithCounts,
    type SidebarRole,
    type SidebarCountsPayload,
    type SidebarSectionConfig,
    type SidebarItemConfig,
  } from './sidebar.config';

  const route = useRoute();
  const router = useRouter();

  const emit = defineEmits<{
    (e: 'clickItem'): void;
  }>();

  const userStore = useUserStore();
  const { user } = storeToRefs(userStore);
  const { currentPalette } = useSystemIdentityTheme();

  const expandedSectionKey = ref<string | null>(null);
  const sidebarSectionsState = ref(getSidebarSections());
  const sidebarCounts = ref<SidebarCountsPayload | null>(null);

  interface SidebarItem {
    type?: SidebarItemConfig['type'];
    path?: string;
    labelKey: string;
    icon?: SidebarSectionConfig['icon'];
    badge?: string;
    hasArrow?: boolean;
    disabled?: boolean;
    flushTop?: boolean;
    link?: string;
  }

  interface SidebarSection {
    key: string;
    labelKey: string;
    icon: SidebarSectionConfig['icon'];
    items: SidebarItem[];
  }

  const currentRole = computed<SidebarRole>(() => {
    return user.value?.isMaster || user.value?.type === UserType.ADMIN ? 'admin' : 'organization';
  });

  const brandLogo = computed(
    () => currentPalette.value.logo || user.value?.setting?.logo || BuildHubLogo,
  );

  const appPrefix = computed(() => {
    return currentRole.value === 'admin' ? '/admin' : '/organization';
  });

  const menu = computed<SidebarSection[]>(() => {
    return sidebarSectionsState.value
      .map((section) => {
        const items = section.items
          .filter((item) => {
            if (!item.roles) return true;

            return item.roles.includes(currentRole.value);
          })
          .map((item) => {
            const link = item.path ? `${appPrefix.value}${item.path}` : undefined;

            return {
              ...item,
              link,
            };
          });

        return {
          key: section.key,
          labelKey: section.labelKey,
          icon: section.icon,
          items,
        };
      })
      .filter((section) => section.items.length > 0);
  });

  const loadSidebarCounts = async () => {
    if (!user.value?.id) {
      sidebarCounts.value = null;
      sidebarSectionsState.value = getSidebarSections();
      return;
    }

    try {
      const response = await SidebarCountsApiService.getInstance().fetchSidebarCounts(
        currentRole.value,
      );
      const responseData: SidebarCountsPayload | undefined = response?.data?.data;

      sidebarCounts.value = responseData ?? null;
      sidebarSectionsState.value = getSidebarSectionsWithCounts(responseData ?? {});
    } catch {
      sidebarCounts.value = null;
      sidebarSectionsState.value = getSidebarSections();
    }
  };

  const getLinkParts = (link: string) => {
    const [path = link, query = ''] = link.split('?');

    return {
      path,
      query: new URLSearchParams(query),
    };
  };

  const isActiveRoute = (link?: string) => {
    if (!link) return false;

    const linkParts = getLinkParts(link);
    const routeMatches =
      route.path === linkParts.path ||
      (linkParts.query.size === 0 && route.path.startsWith(`${linkParts.path}/`));

    if (!routeMatches) return false;

    if (linkParts.query.size === 0) {
      return !Object.keys(route.query ?? {}).some((key) => !['page', 'word'].includes(key));
    }

    for (const [key, value] of linkParts.query.entries()) {
      const routeValue = route.query?.[key];
      const normalizedRouteValue = Array.isArray(routeValue) ? routeValue[0] : routeValue;

      if (String(normalizedRouteValue ?? '') !== value) return false;
    }

    return true;
  };

  const isGroupItem = (item: SidebarItem) => {
    return item.type === 'group';
  };

  const isDisabledItem = (item: SidebarItem) => {
    return item.disabled || !item.link || isGroupItem(item);
  };

  const getItemKey = (item: SidebarItem) => {
    return `${item.type ?? 'item'}-${item.labelKey}-${item.link ?? item.path ?? 'static'}`;
  };

  const activeSection = computed(() => {
    return menu.value.find((section) => section.items.some((item) => isActiveRoute(item.link)));
  });

  watch(
    activeSection,
    (section) => {
      if (section) expandedSectionKey.value = section.key;
      else if (expandedSectionKey.value === null)
        expandedSectionKey.value = menu.value[0]?.key ?? null;
    },
    { immediate: true },
  );

  watch(
    [currentRole, () => user.value?.id, () => route.fullPath],
    () => {
      void loadSidebarCounts();
    },
    { immediate: true },
  );

  const refreshCountsAfterMutation = () => {
    void loadSidebarCounts();
  };

  onMounted(() => {
    window.addEventListener(DATA_MUTATION_SUCCEEDED_EVENT, refreshCountsAfterMutation);
  });

  onBeforeUnmount(() => {
    window.removeEventListener(DATA_MUTATION_SUCCEEDED_EVENT, refreshCountsAfterMutation);
  });

  const contextualSection = computed(
    () =>
      menu.value.find((section) => section.key === expandedSectionKey.value) ??
      activeSection.value ??
      menu.value[0],
  );

  const selectSection = (section: SidebarSection) => {
    expandedSectionKey.value = section.key;
  };

  const handleItemClick = () => {
    emit('clickItem');
  };

  const logout = () => {
    const loginPath = currentRole.value === 'admin' ? '/login-admin' : '/login-organization';

    userStore.logout();

    router.push(loginPath);
  };
</script>

<template>
  <aside class="sidebar-shell" :aria-label="$t('main_navigation')">
    <div class="sidebar-wrapper">
      <header class="brand-panel">
        <div class="brand-mark">
          <img class="logo" :src="brandLogo" :alt="$t('buildhub_logo')" />
        </div>
      </header>

      <router-link
        :to="appPrefix"
        class="rail-home"
        :aria-label="$t('home')"
        :title="$t('home')"
        @click="handleItemClick"
      >
        <i class="pi pi-home" aria-hidden="true" />
      </router-link>

      <nav class="menu-scroll" :aria-label="$t('sidebar_groups')">
        <section v-for="section in menu" :key="section.key" class="menu-group">
          <button
            type="button"
            class="section-toggle"
            :class="{
              active: contextualSection?.key === section.key,
            }"
            :aria-label="$t(section.labelKey)"
            :title="$t(section.labelKey)"
            :aria-expanded="contextualSection?.key === section.key"
            :aria-controls="
              contextualSection?.key === section.key
                ? `workspace-context-${section.key}`
                : undefined
            "
            @click="selectSection(section)"
          >
            <component :is="section.icon" class="section-icon" />
          </button>
        </section>
      </nav>

      <footer class="sidebar-footer">
        <button
          type="button"
          class="menu-item danger"
          :aria-label="$t('logout')"
          :title="$t('logout')"
          @click="logout"
        >
          <span class="item-icon"><IconLogout /></span>
        </button>
      </footer>
    </div>
  </aside>
  <nav
    v-if="contextualSection"
    :id="`workspace-context-${contextualSection.key}`"
    class="workspace-context-nav"
    :aria-label="$t(contextualSection.labelKey)"
  >
    <span class="workspace-context-nav__label">{{ $t(contextualSection.labelKey) }}</span>
    <template v-for="item in contextualSection.items" :key="getItemKey(item)">
      <span v-if="isGroupItem(item)" class="workspace-context-nav__group">{{
        $t(item.labelKey)
      }}</span>
      <router-link
        v-else-if="!isDisabledItem(item)"
        :to="item.link ?? ''"
        class="menu-item context-link"
        :class="{ active: isActiveRoute(item.link) }"
        :aria-current="isActiveRoute(item.link) ? 'page' : undefined"
        :title="$t(item.labelKey)"
        @click="handleItemClick"
      >
        {{ $t(item.labelKey) }}
        <span v-if="item.badge" class="badge">{{ item.badge }}</span>
      </router-link>
      <span v-else class="context-link is-disabled" aria-disabled="true">{{
        $t(item.labelKey)
      }}</span>
    </template>
  </nav>
</template>

<style scoped lang="scss" src="./sidebar-navigation.scss"></style>
