<script setup lang="ts">
  import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useI18n } from 'vue-i18n';
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
  const { t } = useI18n();

  const emit = defineEmits<{
    (e: 'clickItem'): void;
  }>();

  const userStore = useUserStore();
  const { user } = storeToRefs(userStore);
  const { currentPalette } = useSystemIdentityTheme();

  const isPanelOpen = ref(true);
  const expandedSectionKey = ref<string | null>(null);
  const sidebarSectionsState = ref(getSidebarSections());
  const sidebarCounts = ref<SidebarCountsPayload | null>(null);
  const searchQuery = ref('');

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

  const organizationName = computed(() => {
    return sidebarCounts.value?.organization?.name || t('Organization');
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

  const searchableMenu = computed<SidebarSection[]>(() => {
    const query = searchQuery.value.trim().toLowerCase();

    if (!query) {
      return menu.value;
    }

    return menu.value
      .map((section) => {
        const sectionLabel = t(section.labelKey).toLowerCase();
        const filteredItems = section.items.filter((item) => {
          const label = t(item.labelKey).toLowerCase();
          const searchText = `${label} ${sectionLabel} ${item.path ?? ''}`.toLowerCase();

          return searchText.includes(query);
        });

        return {
          ...section,
          items: filteredItems,
        };
      })
      .filter((section) => section.items.length > 0);
  });

  const hasSearchQuery = computed(() => searchQuery.value.trim().length > 0);

  const isSectionExpanded = (section: SidebarSection) => {
    return isPanelOpen.value && (hasSearchQuery.value || expandedSectionKey.value === section.key);
  };

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

  const selectSection = (section: SidebarSection) => {
    if (!isPanelOpen.value) {
      expandedSectionKey.value = section.key;
      isPanelOpen.value = true;
      return;
    }

    if (hasSearchQuery.value) {
      expandedSectionKey.value = section.key;
      searchQuery.value = '';
      return;
    }

    expandedSectionKey.value = expandedSectionKey.value === section.key ? null : section.key;
  };

  const togglePanel = () => {
    isPanelOpen.value = !isPanelOpen.value;
  };

  const handleItemClick = () => {
    searchQuery.value = '';
    emit('clickItem');
    isPanelOpen.value = false;
  };

  const logout = () => {
    const loginPath = currentRole.value === 'admin' ? '/login-admin' : '/login-organization';

    userStore.logout();

    router.push(loginPath);
  };
</script>

<template>
  <aside
    class="sidebar-shell"
    :class="{ 'is-open': isPanelOpen }"
    :aria-label="$t('main_navigation')"
  >
    <div class="sidebar-wrapper">
      <header class="brand-panel">
        <div class="brand-mark">
          <img class="logo" :src="brandLogo" :alt="$t('buildhub_logo')" />
        </div>

        <div v-if="isPanelOpen" class="brand-copy">
          <span class="brand-name">{{ organizationName }}</span>
          <span class="brand-meta">
            {{ currentRole === 'admin' ? $t('Admin') : $t('Organization') }}
          </span>
        </div>

        <button
          type="button"
          class="collapse-toggle"
          :aria-label="isPanelOpen ? $t('collapse_sidebar') : $t('expand_sidebar')"
          :title="isPanelOpen ? $t('collapse_sidebar') : $t('expand_sidebar')"
          :aria-expanded="isPanelOpen"
          @click="togglePanel"
        >
          <i class="pi pi-angle-double-left" aria-hidden="true"></i>
        </button>
      </header>

      <div v-if="isPanelOpen" class="sidebar-profile">
        <span class="sidebar-profile__avatar" aria-hidden="true">
          <img v-if="user?.image" :src="user.image" alt="" />
          <span v-else>{{ (user?.name || $t('user')).trim().charAt(0) }}</span>
        </span>
        <span class="sidebar-profile__copy">
          <strong class="sidebar-profile__name">{{ user?.name || $t('user') }}</strong>
          <span class="sidebar-profile__role">
            {{ currentRole === 'admin' ? $t('Admin') : $t('Organization') }}
          </span>
        </span>
      </div>

      <div v-if="isPanelOpen" class="sidebar-search">
        <i class="pi pi-search sidebar-search__icon" aria-hidden="true"></i>
        <input
          v-model="searchQuery"
          class="sidebar-search__input"
          type="search"
          :placeholder="$t('search_what_you_want')"
          :aria-label="$t('search_what_you_want')"
        />
      </div>

      <nav class="menu-scroll" :aria-label="$t('sidebar_groups')">
        <section v-for="section in searchableMenu" :key="section.key" class="menu-group">
          <button
            type="button"
            class="section-toggle"
            :class="{
              active: activeSection?.key === section.key,
              expanded: isSectionExpanded(section),
            }"
            :aria-label="$t(section.labelKey)"
            :title="$t(section.labelKey)"
            :aria-expanded="isSectionExpanded(section)"
            :aria-controls="
              isSectionExpanded(section) ? `sidebar-section-${section.key}` : undefined
            "
            @click="selectSection(section)"
          >
            <component :is="section.icon" class="section-icon" />
            <span v-if="isPanelOpen" class="section-label">{{ $t(section.labelKey) }}</span>
            <i v-if="isPanelOpen" class="pi pi-chevron-down section-chevron" aria-hidden="true"></i>
          </button>

          <div
            v-if="isSectionExpanded(section)"
            :id="`sidebar-section-${section.key}`"
            class="section-items"
          >
            <template v-for="item in section.items" :key="getItemKey(item)">
              <div
                v-if="isGroupItem(item)"
                class="menu-subgroup"
                :class="{ 'menu-subgroup--flush-top': item.flushTop }"
                :title="$t(item.labelKey)"
              >
                <span v-if="item.icon" class="menu-subgroup__icon">
                  <component :is="item.icon" class="icon" />
                </span>
                <span class="menu-subgroup__label">{{ $t(item.labelKey) }}</span>
              </div>

              <router-link
                v-else-if="!isDisabledItem(item)"
                :to="item.link ?? ''"
                class="menu-item"
                :class="{ active: isActiveRoute(item.link) }"
                :title="$t(item.labelKey)"
                @click="handleItemClick"
              >
                <span class="label">{{ $t(item.labelKey) }}</span>
                <span v-if="item.badge" class="badge">{{ item.badge }}</span>
                <span v-if="item.hasArrow" class="arrow">›</span>
              </router-link>

              <button
                v-else
                type="button"
                class="menu-item is-disabled"
                :title="$t(item.labelKey)"
                disabled
                aria-disabled="true"
              >
                <span class="label">{{ $t(item.labelKey) }}</span>
                <span v-if="item.badge" class="badge">{{ item.badge }}</span>
              </button>
            </template>
          </div>
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
          <span v-if="isPanelOpen" class="label">{{ $t('logout') }}</span>
        </button>
      </footer>
    </div>
  </aside>
</template>

<style scoped lang="scss" src="./sidebar-navigation.scss"></style>
