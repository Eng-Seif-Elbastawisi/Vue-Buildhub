<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { storeToRefs } from 'pinia';

  import BuildHubLogo from '@/assets/images/BuildHubLogo.jpg';

  import AuthArrowIcon from '@/shared/icons/SidebarIcons/AuthArrowIcon.vue';
  import IconLogout from '@/shared/icons/IconLogout.vue';

  import { useUserStore } from '@/stores/user';
  import { sidebarSections, type SidebarRole, type SidebarSectionConfig } from './sidebar.config';

  const route = useRoute();
  const router = useRouter();

  const emit = defineEmits<{
    (e: 'clickItem'): void;
  }>();

  const userStore = useUserStore();
  const { user } = storeToRefs(userStore);

  const isPanelOpen = ref(false);
  const selectedSectionKey = ref<string | null>(null);

  interface SidebarItem {
    path: string;
    labelKey: string;
    icon?: SidebarSectionConfig['icon'];
    badge?: string;
    hasArrow?: boolean;
    link: string;
  }

  interface SidebarSection {
    key: string;
    labelKey: string;
    icon: SidebarSectionConfig['icon'];
    items: SidebarItem[];
  }

  const currentRole = computed<SidebarRole>(() => {
    return user.value?.isMaster || Number(user.value?.type) === 1 ? 'admin' : 'organization';
  });

  const appPrefix = computed(() => {
    return currentRole.value === 'admin' ? '/admin' : '/organization';
  });

  const menu = computed<SidebarSection[]>(() => {
    return sidebarSections
      .map((section) => {
        const items = section.items
          .filter((item) => {
            if (!item.roles) return true;

            return item.roles.includes(currentRole.value);
          })
          .map((item) => ({
            ...item,
            link: `${appPrefix.value}${item.path}`,
          }));

        return {
          key: section.key,
          labelKey: section.labelKey,
          icon: section.icon,
          items,
        };
      })
      .filter((section) => section.items.length > 0);
  });

  const isActiveRoute = (link: string) => {
    return route.path === link || route.path.startsWith(`${link}/`);
  };

  const activeSection = computed(() => {
    return menu.value.find((section) => section.items.some((item) => isActiveRoute(item.link)));
  });

  const selectedSection = computed(() => {
    return (
      menu.value.find((section) => section.key === selectedSectionKey.value) ??
      activeSection.value ??
      menu.value[0]
    );
  });

  watch(
    activeSection,
    (section) => {
      if (section) selectedSectionKey.value = section.key;
    },
    { immediate: true },
  );

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
        <img class="rail-logo" :src="BuildHubLogo" :alt="$t('buildhub_logo')" />
      </div>

      <button
        v-for="section in menu"
        :key="section.key"
        type="button"
        class="rail-action"
        :class="{ active: selectedSection?.key === section.key }"
        :aria-label="$t(section.labelKey)"
        :title="$t(section.labelKey)"
        @click="selectSection(section)"
      >
        <component :is="section.icon" class="rail-icon" />
      </button>
    </nav>

    <aside class="sidebar" :aria-label="$t('main_navigation')">
      <div class="sidebar-wrapper">
        <header class="brand-panel">
          <div class="brand-mark">
            <img class="logo" :src="BuildHubLogo" :alt="$t('buildhub_logo')" />
          </div>

          <div class="brand-copy">
            <span class="brand-name">BuildHub</span>
            <span class="brand-meta">{{
              currentRole === 'admin' ? $t('Admin') : $t('Organization')
            }}</span>
          </div>

          <button
            type="button"
            class="collapse-toggle"
            :aria-label="$t('collapse_sidebar')"
            :title="$t('collapse_sidebar')"
            @click="closePanel"
          >
            <AuthArrowIcon />
          </button>
        </header>

        <div class="menu-scroll">
          <section v-if="selectedSection" class="menu-group">
            <p class="group-title">
              {{ $t(selectedSection.labelKey) }}
            </p>

            <router-link
              v-for="item in selectedSection.items"
              :key="item.link"
              :to="item.link"
              class="menu-item"
              :class="{ active: isActiveRoute(item.link) }"
              :title="$t(item.labelKey)"
              @click="handleItemClick"
            >
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
          </section>
        </div>

        <footer class="sidebar-footer">
          <div class="auth-container">
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
                  {{ currentRole === 'admin' ? $t('Admin') : $t('Organization') }}
                </span>
              </div>
            </div>
          </div>

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
    padding: 16px 12px;
  }

  .brand-panel {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 56px;
    padding-bottom: 14px;
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
    color: var(--sidebar-muted);
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

  [dir='rtl'] .collapse-toggle {
    transform: rotate(0deg);
  }

  .collapse-toggle:hover {
    color: var(--PrimaryColor);
    border-color: var(--PrimaryColor);
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
    gap: 6px;
  }

  .group-title {
    margin: 0 0 8px;
    padding: 0 8px;
    color: var(--sidebar-muted);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0;
    text-transform: uppercase;
  }

  .menu-item {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 42px;
    padding: 9px 10px;
    border: 0;
    border-radius: var(--radius-sm);
    color: var(--sidebar-text);
    background: transparent;
    font-size: 14px;
    font-weight: 800;
    text-align: start;
    text-decoration: none;
    cursor: pointer;
    transition:
      background var(--transition-fast),
      color var(--transition-fast),
      transform var(--transition-fast);
  }

  .menu-item:hover {
    color: var(--gray-900);
    background: var(--sidebar-hover);
    transform: translateX(2px);
  }

  [dir='rtl'] .menu-item:hover {
    transform: translateX(-2px);
  }

  .menu-item.active {
    color: var(--sidebar-active-text);
    background: var(--sidebar-active-bg);
  }

  .rail-icon,
  .icon {
    width: 18px;
    height: 18px;
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
    flex: 0 0 28px;
    width: 28px;
    height: 28px;
    border-radius: var(--radius-xs);
    background: var(--gray-100);
  }

  .menu-item.active .item-icon {
    background: var(--white-alpha-20);
  }

  .label {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .badge {
    color: var(--BgWhite);
    background: var(--Red);
    font-size: 10px;
    padding: 2px 6px;
    border-radius: var(--radius-full);
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
</style>
