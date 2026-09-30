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

const isPanelOpen = ref(false);
const selectedSectionKey = ref<string | null>(null);
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
  if (currentRole.value !== 'organization') {
    sidebarCounts.value = null;
    sidebarSectionsState.value = getSidebarSections();
    return;
  }

  if (!user.value?.id) {
    sidebarCounts.value = null;
    sidebarSectionsState.value = getSidebarSections();
    return;
  }

  try {
    const response = await SidebarCountsApiService.getInstance().fetchSidebarCounts();
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

const selectedSection = computed(() => {
  const bySelection = searchableMenu.value.find(
    (section) => section.key === selectedSectionKey.value,
  );
  const fallbackSection = activeSection.value ?? searchableMenu.value[0];

  return bySelection ?? fallbackSection ?? null;
});

watch(
  activeSection,
  (section) => {
    if (section) selectedSectionKey.value = section.key;
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
  if (selectedSectionKey.value === section.key && isPanelOpen.value) {
    isPanelOpen.value = false;
    return;
  }

  selectedSectionKey.value = section.key;
  isPanelOpen.value = true;
};

const closePanel = () => {
  isPanelOpen.value = false;
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
  <aside class="sidebar-shell" :class="{ 'is-open': isPanelOpen }">
    <nav class="sidebar-rail" :aria-label="$t('sidebar_groups')">
      <div class="rail-brand">
        <img class="rail-logo" :src="brandLogo" :alt="$t('buildhub_logo')" />
      </div>

      <button v-for="section in menu" :key="section.key" type="button" class="rail-action"
        :class="{ active: selectedSection?.key === section.key }" :aria-label="$t(section.labelKey)"
        :title="$t(section.labelKey)" @click="selectSection(section)">
        <component :is="section.icon" class="rail-icon" />
      </button>
    </nav>

    <aside class="sidebar" :aria-label="$t('main_navigation')">
      <div class="sidebar-wrapper">
        <header class="brand-panel">
          <div class="brand-mark">
            <img class="logo" :src="brandLogo" :alt="$t('buildhub_logo')" />
          </div>

          <div class="brand-copy">
            <span class="brand-name">{{ organizationName }}</span>

            <span class="brand-meta">
              {{ currentRole === 'admin' ? $t('Admin') : $t('Organization') }}
            </span>
          </div>

          <button type="button" class="collapse-toggle" :aria-label="$t('collapse_sidebar')"
            :title="$t('collapse_sidebar')" @click="closePanel">
            <span class="collapse-toggle__icon" aria-hidden="true">×</span>
          </button>
        </header>

        <div class="menu-scroll">
          <div class="sidebar-search">
            <input v-model="searchQuery" class="sidebar-search__input" type="search"
              :placeholder="$t('search_what_you_want')" :aria-label="$t('search_what_you_want')" />
          </div>

          <template v-if="searchQuery">
            <section v-for="section in searchableMenu" :key="section.key" class="menu-group">
              <p class="group-title">
                {{ $t(section.labelKey) }}
              </p>

              <template v-for="item in section.items" :key="getItemKey(item)">
                <div v-if="isGroupItem(item)" class="menu-subgroup"
                  :class="{ 'menu-subgroup--flush-top': item.flushTop }" :title="$t(item.labelKey)">
                  <span v-if="item.icon" class="menu-subgroup__icon">
                    <component :is="item.icon" class="icon" />
                  </span>

                  <span class="menu-subgroup__label">
                    {{ $t(item.labelKey) }}
                  </span>
                </div>

                <router-link v-else-if="!isDisabledItem(item)" :to="item.link ?? ''" class="menu-item"
                  :class="{ active: isActiveRoute(item.link) }" :title="$t(item.labelKey)" @click="handleItemClick">
                  <span class="item-icon">
                    <component :is="item.icon" v-if="item.icon" class="icon" />
                  </span>

                  <span class="label">
                    {{ $t(item.labelKey) }}
                  </span>

                  <span v-if="item.badge" class="badge">
                    {{ item.badge }}
                  </span>

                  <span v-if="item.hasArrow" class="arrow">›</span>
                </router-link>

                <button v-else type="button" class="menu-item is-disabled" :title="$t(item.labelKey)" disabled
                  aria-disabled="true">
                  <span class="item-icon">
                    <component :is="item.icon" v-if="item.icon" class="icon" />
                  </span>

                  <span class="label">
                    {{ $t(item.labelKey) }}
                  </span>

                  <span v-if="item.badge" class="badge">
                    {{ item.badge }}
                  </span>
                </button>
              </template>
            </section>
          </template>

          <section v-else-if="selectedSection" class="menu-group">
            <p class="group-title">
              {{ $t(selectedSection.labelKey) }}
            </p>

            <template v-for="item in selectedSection.items" :key="getItemKey(item)">
              <div v-if="isGroupItem(item)" class="menu-subgroup"
                :class="{ 'menu-subgroup--flush-top': item.flushTop }" :title="$t(item.labelKey)">
                <span v-if="item.icon" class="menu-subgroup__icon">
                  <component :is="item.icon" class="icon" />
                </span>

                <span class="menu-subgroup__label">
                  {{ $t(item.labelKey) }}
                </span>
              </div>

              <router-link v-else-if="!isDisabledItem(item)" :to="item.link ?? ''" class="menu-item"
                :class="{ active: isActiveRoute(item.link) }" :title="$t(item.labelKey)" @click="handleItemClick">
                <span class="item-icon">
                  <component :is="item.icon" v-if="item.icon" class="icon" />
                </span>

                <span class="label">
                  {{ $t(item.labelKey) }}
                </span>

                <span v-if="item.badge" class="badge">
                  {{ item.badge }}
                </span>

                <span v-if="item.hasArrow" class="arrow">›</span>
              </router-link>

              <button v-else type="button" class="menu-item is-disabled" :title="$t(item.labelKey)" disabled
                aria-disabled="true">
                <span class="item-icon">
                  <component :is="item.icon" v-if="item.icon" class="icon" />
                </span>

                <span class="label">
                  {{ $t(item.labelKey) }}
                </span>

                <span v-if="item.badge" class="badge">
                  {{ item.badge }}
                </span>
              </button>
            </template>
          </section>
        </div>

        <footer class="sidebar-footer">
          <!-- <div class="auth-container">
            <div class="auth-data">
              <img
                :src="user?.image || 'https://cyber.comolho.com/static/img/avatar.png'"
                :alt="$t('user')"
              />

              <div class="user-data">
                <span class="name">
                  {{ user?.name || $t('user') }}
                </span>

                <span class="status">
                  {{ currentRole === 'admin' ? $t('Admin') : organizationName }}
                </span>
              </div>
            </div>
          </div> -->

          <button type="button" class="menu-item danger" :title="$t('logout')" @click="logout">
            <span class="item-icon">
              <IconLogout />
            </span>
            <span class="label">{{ $t('logout') }}</span>
          </button>
        </footer>
      </div>
    </aside>
  </aside>
</template>

<style scoped lang="scss">
.sidebar-shell {
  --sidebar-shell-bg: var(--SecondaryColor);
  --sidebar-pane-bg: var(--BgWhite);
  --sidebar-pane-border: var(--border-weak);
  --sidebar-text: var(--gray-700);
  --sidebar-muted: var(--gray-500);
  --sidebar-hover: var(--gray-100);
  --sidebar-active-bg: var(--PrimaryColor);
  --sidebar-active-text: var(--BgWhite);
  --sidebar-copper-soft: var(--warning-light);
  --sidebar-group-title: var(--gray-400);
  --sidebar-menu-text: var(--gray-800);
  --sidebar-menu-hover-text: var(--gray-900);
  --sidebar-menu-hover-bg: var(--gray-50);
  --sidebar-icon-text: var(--gray-500);
  --sidebar-icon-bg: var(--gray-100);
  --sidebar-icon-active-bg: var(--PrimaryColor-light);
  --sidebar-badge-border: var(--warning);
  --sidebar-badge-text: var(--warning-dark);
  --sidebar-badge-bg: var(--warning-light);

  position: fixed;
  inset-block: 0;
  inset-inline-start: 0;
  z-index: 1200;
  width: 66px;
  height: 100vh;
  pointer-events: none;
}

.sidebar-rail {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 66px;
  height: 100%;
  padding: 14px 8px;
  background: var(--sidebar-shell-bg);
  pointer-events: auto;
}

.rail-brand {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  margin-bottom: 10px;
  border-radius: var(--radius-sm);
  background: var(--white-alpha-15);
}

.rail-logo {
  width: 30px;
  height: 30px;
  object-fit: contain;
  border-radius: var(--radius-xs);
}

.rail-action {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: var(--radius-sm);
  color: var(--gray-400);
  background: transparent;
  cursor: pointer;
  transition:
    background var(--transition-fast),
    color var(--transition-fast),
    transform var(--transition-fast);
}

.rail-action:hover,
.rail-action.active {
  color: var(--sidebar-active-text);
  background: var(--PrimaryColor);
}

.rail-action:hover {
  transform: translateY(-1px);
}

.sidebar {
  position: absolute;
  inset-block: 0;
  inset-inline-start: calc(100% + 0px);
  width: 256px;
  overflow: hidden;
  color: var(--sidebar-text);
  background: var(--sidebar-pane-bg);
  border-inline-end: 1px solid var(--sidebar-pane-border);
  box-shadow: var(--shadow-lg);
  opacity: 0;
  pointer-events: none;
  transform: translateX(-10px);
  transition:
    opacity var(--transition),
    transform var(--transition);
}

[dir='rtl'] .sidebar {
  transform: translateX(10px);
}

.sidebar-shell.is-open .sidebar {
  opacity: 1;
  pointer-events: auto;
  transform: translateX(0);
}

.sidebar-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  padding: 0.7rem 0.2rem;
}

.brand-panel {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 56px;
  padding: 0 0.4rem 14px;
  border-bottom: 1px solid var(--sidebar-pane-border);
}

.brand-mark {
  display: grid;
  place-items: center;
  flex: 0 0 36px;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  background: var(--sidebar-copper-soft);
}

.logo {
  width: 26px;
  height: 26px;
  object-fit: contain;
  border-radius: var(--radius-xs);
}

.brand-copy,
.user-data {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.brand-name,
.name {
  overflow: hidden;
  color: var(--gray-900);
  font-size: 14px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.brand-meta,
.status {
  color: black;
  font-size: 11px;
  font-weight: 600;
}

.collapse-toggle {
  display: grid;
  place-items: center;
  flex: 0 0 30px;
  width: 30px;
  height: 30px;
  margin-inline-start: auto;
  border: 1px solid var(--sidebar-pane-border);
  border-radius: var(--radius-sm);
  color: var(--sidebar-muted);
  background: var(--BgWhite);
  cursor: pointer;
  transform: rotate(180deg);
  transition:
    border-color var(--transition-fast),
    color var(--transition-fast);
}

.collapse-toggle:hover {
  color: var(--PrimaryColor);
  border-color: var(--PrimaryColor);
}

.collapse-toggle__icon {
  line-height: 1;
  font-size: 1.25rem;
  font-weight: 700;
}

.menu-scroll {
  flex: 1;
  min-height: 0;
  margin: 16px -4px;
  padding: 0 4px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--gray-300) transparent;
}

.sidebar-search {
  padding: 0 4px 12px;
  position: relative;
  margin-block-end: 0.25rem;
}

.sidebar-search__input {
  width: 100%;
  min-height: 36px;
  padding: 0.35rem 0.75rem;
  border: 1px solid var(--sidebar-pane-border);
  border-radius: 12px;
  color: var(--sidebar-menu-text);
  background: var(--BgWhite);
  font-family: inherit;
  font-size: 12px;
  outline: none;
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.sidebar-search__input:focus {
  border-color: var(--PrimaryColor);
  box-shadow: 0 0 0 2px color-mix(in sRGB, var(--PrimaryColor) 18%, transparent);
}

.sidebar-search::after {
  content: '';
  position: absolute;
  inset-inline-start: 4px;
  right: 4px;
  bottom: 0;
  height: 1px;
  background-image: repeating-linear-gradient(90deg,
      var(--PrimaryColor) 0 5px,
      transparent 5px 8px);
  background-size: 8px 1px;
  background-position: 0 0;
  pointer-events: none;
  animation: sidebar-search-dash 1s linear infinite;
}

@keyframes sidebar-search-dash {
  from {
    background-position: 0 0;
  }

  to {
    background-position: 8px 0;
  }
}

.menu-scroll::-webkit-scrollbar {
  width: 6px;
}

.menu-scroll::-webkit-scrollbar-thumb {
  border-radius: var(--radius-full);
  background: var(--gray-300);
}

.menu-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 1rem 0;
}

.group-title {
  margin: 0 0 18px;
  padding: 0 8px;
  color: var(--sidebar-group-title);
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0;
  text-transform: uppercase;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 42px;
  padding: 7px 10px;
  border: 0;
  border-radius: 14px;
  color: var(--sidebar-menu-text);
  background: transparent;
  font-size: 14px;
  font-weight: 900;
  text-align: start;
  text-decoration: none;
  cursor: pointer;
  transition:
    background var(--transition-fast),
    color var(--transition-fast),
    transform var(--transition-fast);
}

.menu-item:hover {
  color: var(--sidebar-menu-hover-text);
  background: var(--sidebar-menu-hover-bg);
  transform: translateX(2px);
}

[dir='rtl'] .menu-item:hover {
  transform: translateX(-2px);
}

.menu-item.active {
  color: var(--sidebar-menu-text);
  background: transparent;
}

.rail-icon,
.icon {
  width: 20px;
  height: 20px;
}

.rail-icon.pi,
.icon.pi {
  display: grid;
  place-items: center;
  font-size: 18px;
  line-height: 1;
}

.rail-icon svg,
.icon svg {
  width: 20px;
  height: 20px;
}

.rail-action {
  color: var(--gray-300);
}

.rail-action:hover,
.rail-action.active {
  color: var(--sidebar-active-text);
  background: var(--sidebar-active-bg);
}

.rail-icon :deep(svg),
.icon :deep(svg),
.item-icon :deep(svg) {
  width: 18px;
  height: 18px;
}

.item-icon {
  display: grid;
  place-items: center;
  flex: 0 0 30px;
  width: 30px;
  height: 30px;
  border-radius: 11px;
  color: var(--sidebar-icon-text);
  background: var(--sidebar-icon-bg);
}

.menu-item.active .item-icon {
  color: var(--PrimaryColor-hover);
  background: var(--sidebar-icon-active-bg);
}

.label {
  flex: 1;
  overflow: hidden;
  color: var(--sidebar-menu-text);
  font-size: 12px;
  font-weight: 700;
  text-overflow: ellipsis;
}

.badge {
  display: grid;
  place-items: center;
  min-width: 92px;
  height: 22px;
  padding: 0 14px;
  border: 1px solid var(--sidebar-badge-border);
  border-radius: 999px;
  color: var(--sidebar-badge-text);
  background: var(--sidebar-badge-bg);
  font-size: 12px;
  font-weight: 900;
  line-height: 1;
}

.arrow {
  opacity: 0.6;
}

.sidebar-footer {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--sidebar-pane-border);
}

.auth-container {
  width: 100%;
  padding: 8px;
  border-radius: var(--radius-sm);
  background: var(--gray-50);
}

.auth-data {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.auth-data img {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  object-fit: cover;
}

.menu-item.danger {
  width: 100%;
  color: var(--danger);
}

.menu-item.danger:hover {
  color: var(--danger-dark);
  background: var(--danger-light);
}

@media (max-width: 768px) {
  .sidebar-rail {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    width: 66px;
    height: 100%;
    padding: 14px 8px;
    background: var(--sidebar-shell-bg);
    pointer-events: auto;
  }

  .rail-brand {
    display: grid;
    place-items: center;
    width: 42px;
    height: 42px;
    margin-bottom: 10px;
    border-radius: var(--radius-sm);
    background: var(--white-alpha-15);
  }

  .rail-logo {
    width: 30px;
    height: 30px;
    object-fit: contain;
    border-radius: var(--radius-xs);
  }

  .rail-action {
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    border: 0;
    border-radius: var(--radius-sm);
    color: var(--gray-400);
    background: transparent;
    cursor: pointer;
    transition:
      background var(--transition-fast),
      color var(--transition-fast),
      transform var(--transition-fast);
  }

  .rail-action:hover,
  .rail-action.active {
    color: var(--sidebar-active-text);
    background: var(--PrimaryColor);
  }

  .rail-action:hover {
    transform: translateY(-1px);
  }

  .sidebar {
    position: absolute;
    inset-block: 0;
    inset-inline-start: calc(100% + 0px);
    width: 256px;
    overflow: hidden;
    color: var(--sidebar-text);
    background: var(--sidebar-pane-bg);
    border-inline-end: 1px solid var(--sidebar-pane-border);
    box-shadow: var(--shadow-lg);
    opacity: 0;
    pointer-events: none;
    transform: translateX(-10px);
    transition:
      opacity var(--transition),
      transform var(--transition);
  }

  [dir='rtl'] .sidebar {
    transform: translateX(10px);
  }

  .sidebar-shell.is-open .sidebar {
    opacity: 1;
    pointer-events: auto;
    transform: translateX(0);
  }

  .sidebar-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    padding: 0.7rem 0.2rem;
  }

  .brand-panel {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 56px;
    padding: 0 0.4rem 14px;
    border-bottom: 1px solid var(--sidebar-pane-border);
  }

  .brand-mark {
    display: grid;
    place-items: center;
    flex: 0 0 36px;
    width: 36px;
    height: 36px;
    border-radius: var(--radius-sm);
    background: var(--sidebar-copper-soft);
  }

  .logo {
    width: 26px;
    height: 26px;
    object-fit: contain;
    border-radius: var(--radius-xs);
  }

  .brand-copy,
  .user-data {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .brand-name,
  .name {
    overflow: hidden;
    color: var(--gray-900);
    font-size: 14px;
    font-weight: 800;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .brand-meta,
  .status {
    color: black;
    font-size: 11px;
    font-weight: 600;
  }

  .collapse-toggle {
    display: grid;
    place-items: center;
    flex: 0 0 30px;
    width: 30px;
    height: 30px;
    margin-inline-start: auto;
    border: 1px solid var(--sidebar-pane-border);
    border-radius: var(--radius-sm);
    color: var(--sidebar-muted);
    background: var(--BgWhite);
    cursor: pointer;
    transform: rotate(180deg);
    transition:
      border-color var(--transition-fast),
      color var(--transition-fast);
  }

  .collapse-toggle:hover {
    color: var(--PrimaryColor);
    border-color: var(--PrimaryColor);
  }

  .collapse-toggle__icon {
    line-height: 1;
    font-size: 1.25rem;
    font-weight: 700;
  }

  .menu-scroll {
    flex: 1;
    min-height: 0;
    margin: 16px -4px;
    padding: 0 4px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: var(--gray-300) transparent;
  }

  .sidebar-search {
    padding: 0 4px 12px;
    position: relative;
    margin-block-end: 0.25rem;
  }

  .sidebar-search__input {
    width: 100%;
    min-height: 36px;
    padding: 0.35rem 0.75rem;
    border: 1px solid var(--sidebar-pane-border);
    border-radius: 12px;
    color: var(--sidebar-menu-text);
    background: var(--BgWhite);
    font-family: inherit;
    font-size: 12px;
    outline: none;
    transition:
      border-color var(--transition-fast),
      box-shadow var(--transition-fast);
  }

  .sidebar-search__input:focus {
    border-color: var(--PrimaryColor);
    box-shadow: 0 0 0 2px color-mix(in sRGB, var(--PrimaryColor) 18%, transparent);
  }

  .sidebar-search::after {
    content: '';
    position: absolute;
    inset-inline-start: 4px;
    right: 4px;
    bottom: 0;
    height: 1px;
    background-image: repeating-linear-gradient(90deg,
        var(--PrimaryColor) 0 5px,
        transparent 5px 8px);
    background-size: 8px 1px;
    background-position: 0 0;
    pointer-events: none;
    animation: sidebar-search-dash 1s linear infinite;
  }

  @keyframes sidebar-search-dash {
    from {
      background-position: 0 0;
    }

    to {
      background-position: 8px 0;
    }
  }

  .menu-scroll::-webkit-scrollbar {
    width: 6px;
  }

  .menu-scroll::-webkit-scrollbar-thumb {
    border-radius: var(--radius-full);
    background: var(--gray-300);
  }

  .menu-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin: 1rem 0;
  }

  .group-title {
    margin: 0 0 18px;
    padding: 0 8px;
    color: var(--sidebar-group-title);
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 0;
    text-transform: uppercase;
  }

  .menu-item {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 42px;
    padding: 7px 10px;
    border: 0;
    border-radius: 14px;
    color: var(--sidebar-menu-text);
    background: transparent;
    font-size: 14px;
    font-weight: 900;
    text-align: start;
    text-decoration: none;
    cursor: pointer;
    transition:
      background var(--transition-fast),
      color var(--transition-fast),
      transform var(--transition-fast);
  }

  .menu-item:hover {
    color: var(--sidebar-menu-hover-text);
    background: var(--sidebar-menu-hover-bg);
    transform: translateX(2px);
  }

  [dir='rtl'] .menu-item:hover {
    transform: translateX(-2px);
  }

  .menu-item.active {
    color: var(--sidebar-menu-text);
    background: transparent;
  }

  .rail-icon,
  .icon {
    width: 20px;
    height: 20px;
  }

  .rail-icon.pi,
  .icon.pi {
    display: grid;
    place-items: center;
    font-size: 18px;
    line-height: 1;
  }

  .rail-icon svg,
  .icon svg {
    width: 20px;
    height: 20px;
  }

  .rail-action {
    color: var(--gray-300);
  }

  .rail-action:hover,
  .rail-action.active {
    color: var(--sidebar-active-text);
    background: var(--sidebar-active-bg);
  }

  .rail-icon :deep(svg),
  .icon :deep(svg),
  .item-icon :deep(svg) {
    width: 18px;
    height: 18px;
  }

  .item-icon {
    display: grid;
    place-items: center;
    flex: 0 0 30px;
    width: 30px;
    height: 30px;
    border-radius: 11px;
    color: var(--sidebar-icon-text);
    background: var(--sidebar-icon-bg);
  }

  .menu-item.active .item-icon {
    color: var(--PrimaryColor-hover);
    background: var(--sidebar-icon-active-bg);
  }

  .label {
    flex: 1;
    overflow: hidden;
    color: var(--sidebar-menu-text);
    font-size: 12px;
    font-weight: 700;
    text-overflow: ellipsis;
  }

  .badge {
    display: grid;
    place-items: center;
    min-width: 92px;
    height: 22px;
    padding: 0 14px;
    border: 1px solid var(--sidebar-badge-border);
    border-radius: 999px;
    color: var(--sidebar-badge-text);
    background: var(--sidebar-badge-bg);
    font-size: 12px;
    font-weight: 900;
    line-height: 1;
  }

  .arrow {
    opacity: 0.6;
  }

  .sidebar-footer {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-top: 12px;
    border-top: 1px solid var(--sidebar-pane-border);
  }

  .auth-container {
    width: 100%;
    padding: 8px;
    border-radius: var(--radius-sm);
    background: var(--gray-50);
  }

  .auth-data {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }

  .auth-data img {
    width: 36px;
    height: 36px;
    border-radius: var(--radius-full);
    object-fit: cover;
  }

  .menu-item.danger {
    width: 100%;
    color: var(--danger);
  }

  .menu-item.danger:hover {
    color: var(--danger-dark);
    background: var(--danger-light);
  }

  @media (max-width: 768px) {
    .sidebar-shell,
    .sidebar-rail {
      width: 58px;
    }

    .sidebar {
      width: min(256px, calc(100vw - 58px));
    }

    .rail-action,
    .rail-brand {
      width: 40px;
      height: 40px;
    }
  }
}

.menu-subgroup {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 28px;
  margin: 14px 6px 4px;
  padding: 0 4px;
  color: var(--sidebar-group-title);
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0;
  text-transform: uppercase;
}

.menu-subgroup--flush-top {
  margin-block-start: 0;
}

.menu-subgroup__icon {
  display: grid;
  place-items: center;
  flex: 0 0 22px;
  width: 22px;
  height: 22px;
  color: var(--sidebar-group-title);
}

.menu-subgroup__label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu-item.is-disabled,
.menu-item.is-disabled:hover {
  color: var(--sidebar-muted);
  background: transparent;
  cursor: not-allowed;
  opacity: 0.68;
  transform: none;
}
</style>
