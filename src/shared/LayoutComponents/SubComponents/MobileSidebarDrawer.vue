<script setup lang="ts">
  import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { storeToRefs } from 'pinia';
  import Accordion from 'primevue/accordion';
  import AccordionContent from 'primevue/accordioncontent';
  import AccordionHeader from 'primevue/accordionheader';
  import AccordionPanel from 'primevue/accordionpanel';

  import BuildHubLogo from '@/assets/images/BuildHubLogo.jpg';
  import AuthArrowIcon from '@/shared/icons/SidebarIcons/AuthArrowIcon.vue';
  import IconLogout from '@/shared/icons/IconLogout.vue';
  import { useUserStore } from '@/stores/user';
  import { DATA_MUTATION_SUCCEEDED_EVENT } from '@/base/Presentation/Controller/dataMutationEvent';
  import SidebarCountsApiService from './sidebar.counts.api-service';
  import { UserType } from '@/modules/auth/core/constants/userType.enum';
  import {
    getSidebarSections,
    getSidebarSectionsWithCounts,
    type SidebarCountsPayload,
    type SidebarItemConfig,
    type SidebarRole,
    type SidebarSectionConfig,
  } from './sidebar.config';

  const props = defineProps<{
    open: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'update:open', value: boolean): void;
  }>();

  const route = useRoute();
  const router = useRouter();
  const userStore = useUserStore();
  const { user } = storeToRefs(userStore);
  const expandedSections = ref<string[]>([]);
  const sidebarSectionsState = ref(getSidebarSections());

  interface SidebarItem {
    type?: SidebarItemConfig['type'];
    path?: string;
    labelKey: string;
    icon?: SidebarSectionConfig['icon'];
    badge?: string;
    hasArrow?: boolean;
    disabled?: boolean;
    link?: string;
  }

  interface SidebarSection {
    key: string;
    labelKey: string;
    items: SidebarItem[];
  }

  const currentRole = computed<SidebarRole>(() => {
    return user.value?.isMaster || user.value?.type === UserType.ADMIN ? 'admin' : 'organization';
  });

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
          items,
        };
      })
      .filter((section) => section.items.length > 0);
  });

  const loadSidebarCounts = async () => {
    if (!user.value?.id) {
      sidebarSectionsState.value = getSidebarSections();
      return;
    }

    try {
      const response = await SidebarCountsApiService.getInstance().fetchSidebarCounts();
      const responseData: SidebarCountsPayload | undefined = response?.data?.data;

      sidebarSectionsState.value = getSidebarSectionsWithCounts(responseData ?? {});
    } catch {
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

  const getDefaultExpandedSections = () => {
    const activeSections = menu.value
      .filter((section) => section.items.some((item) => isActiveRoute(item.link)))
      .map((section) => section.key);

    if (activeSections.length > 0) return activeSections;

    const firstSectionKey = menu.value[0]?.key;

    return firstSectionKey ? [firstSectionKey] : [];
  };

  const close = () => {
    emit('update:open', false);
  };

  const logout = () => {
    const loginPath = currentRole.value === 'admin' ? '/login-admin' : '/login-organization';

    userStore.logout();
    close();
    router.push(loginPath);
  };

  const onKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') close();
  };

  watch(
    () => props.open,
    (isOpen) => {
      document.body.classList.toggle('mobile-sidebar-open', isOpen);

      if (isOpen) {
        expandedSections.value = getDefaultExpandedSections();
        void loadSidebarCounts();
        window.addEventListener('keydown', onKeydown);
      } else {
        window.removeEventListener('keydown', onKeydown);
      }
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
    document.body.classList.remove('mobile-sidebar-open');
    window.removeEventListener('keydown', onKeydown);
    window.removeEventListener(DATA_MUTATION_SUCCEEDED_EVENT, refreshCountsAfterMutation);
  });
</script>

<template>
  <Teleport to="body">
    <Transition name="mobile-sidebar-fade">
      <div v-if="open" class="mobile-sidebar-layer" @click.self="close">
        <aside class="mobile-sidebar-drawer" :aria-label="$t('main_navigation')">
          <header class="drawer-header">
            <div class="drawer-brand">
              <img class="drawer-logo" :src="BuildHubLogo" :alt="$t('buildhub_logo')" />
              <div class="drawer-copy">
                <strong>{{ $t('buildhub') }}</strong>
                <span>{{ currentRole === 'admin' ? $t('Admin') : $t('Organization') }}</span>
              </div>
            </div>

            <button
              type="button"
              class="drawer-close"
              :aria-label="$t('close_sidebar')"
              @click="close"
            >
              <AuthArrowIcon />
            </button>
          </header>
          <Accordion v-model:value="expandedSections" multiple class="drawer-accordion">
            <AccordionPanel
              v-for="section in menu"
              :key="section.key"
              :value="section.key"
              class="drawer-section"
            >
              <AccordionHeader class="drawer-section-header">
                <span class="section-title">
                  {{ $t(section.labelKey) }}
                </span>
              </AccordionHeader>

              <AccordionContent class="drawer-section-content">
                <div class="drawer-section-links">
                  <template v-for="item in section.items" :key="getItemKey(item)">
                    <div
                      v-if="isGroupItem(item)"
                      class="drawer-subgroup"
                      :title="$t(item.labelKey)"
                    >
                      <span class="drawer-subgroup__icon">
                        <component :is="item.icon" v-if="item.icon" class="icon" />
                      </span>

                      <span class="drawer-subgroup__label">
                        {{ $t(item.labelKey) }}
                      </span>
                    </div>

                    <router-link
                      v-else-if="!isDisabledItem(item)"
                      :to="item.link ?? ''"
                      class="drawer-item"
                      :class="{ active: isActiveRoute(item.link) }"
                      @click="close"
                    >
                      <span class="item-icon">
                        <component :is="item.icon" v-if="item.icon" class="icon" />
                      </span>

                      <span class="item-label">{{ $t(item.labelKey) }}</span>

                      <span v-if="item.badge" class="badge">{{ item.badge }}</span>
                    </router-link>

                    <button
                      v-else
                      type="button"
                      class="drawer-item is-disabled"
                      disabled
                      aria-disabled="true"
                    >
                      <span class="item-icon">
                        <component :is="item.icon" v-if="item.icon" class="icon" />
                      </span>

                      <span class="item-label">{{ $t(item.labelKey) }}</span>

                      <span v-if="item.badge" class="badge">{{ item.badge }}</span>
                    </button>
                  </template>
                </div>
              </AccordionContent>
            </AccordionPanel>
          </Accordion>

          <footer class="drawer-footer">
            <div class="user-card">
              <img
                :src="user?.image || 'https://cyber.comolho.com/static/img/avatar.png'"
                :alt="$t('user')"
              />
              <div>
                <strong>{{ user?.name || $t('user') }}</strong>
                <span>{{ currentRole === 'admin' ? $t('Admin') : $t('Organization') }}</span>
              </div>
            </div>

            <button type="button" class="logout-btn" @click="logout">
              <IconLogout />
              <span>{{ $t('logout') }}</span>
            </button>
          </footer>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
  .mobile-sidebar-layer {
    position: fixed;
    inset: 0;
    z-index: 1500;
    display: flex;
    justify-content: flex-start;
    background: var(--black-alpha-45);
  }

  [dir='rtl'] .mobile-sidebar-layer {
    justify-content: flex-end;
  }

  .mobile-sidebar-drawer {
    display: flex;
    flex-direction: column;
    width: min(320px, calc(100vw - 28px));
    height: 100%;
    background: var(--BgWhite);
    box-shadow: var(--shadow-xl);
    border-inline-end: 1px solid var(--border-weak);
    border-start-end-radius: var(--radius-lg);
    border-end-end-radius: var(--radius-lg);
    overflow: hidden;
  }

  [dir='rtl'] .mobile-sidebar-drawer {
    border-inline: 1px solid var(--border-weak) 0;
    border-radius: var(--radius-lg) 0 0 var(--radius-lg);
  }

  .drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 16px;
    border-bottom: 1px solid var(--border-weak);
  }

  .drawer-brand,
  .user-card,
  .logout-btn,
  .drawer-item,
  .drawer-subgroup {
    display: flex;
    align-items: center;
  }

  .drawer-brand {
    gap: 10px;
    min-width: 0;
  }

  .drawer-logo,
  .user-card img {
    object-fit: cover;
    border-radius: var(--radius-sm);
  }

  .drawer-logo {
    width: 42px;
    height: 42px;
  }

  .drawer-copy,
  .user-card div {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .drawer-copy strong,
  .user-card strong {
    overflow: hidden;
    color: var(--gray-900);
    font-size: 14px;
    font-weight: 800;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .drawer-copy span,
  .user-card span {
    color: var(--gray-500);
    font-size: 11px;
    font-weight: 600;
  }

  .drawer-close {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-sm);
    color: var(--gray-500);
    background: var(--BgWhite);
    cursor: pointer;
    transform: rotate(180deg);
  }

  [dir='rtl'] .drawer-close {
    transform: rotate(0deg);
  }

  .drawer-accordion {
    flex: 1;
    min-height: 0;
    padding: 14px;
    overflow-y: auto;
  }

  .drawer-accordion :deep(.p-accordionpanel) {
    border: 0;
    background: transparent;
  }

  .drawer-accordion :deep(.p-accordionpanel + .p-accordionpanel) {
    margin-top: 12px;
  }

  .drawer-accordion :deep(.p-accordionheader) {
    padding: 0;
    border: 0;
    color: inherit;
    background: transparent;
    box-shadow: none;
  }

  .drawer-accordion :deep(.p-accordionheader-toggle-icon) {
    color: var(--gray-500);
  }

  .drawer-accordion :deep(.p-accordioncontent-content) {
    padding: 0;
    border: 0;
    background: transparent;
  }

  .drawer-section-links {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding-block-start: 8px;
  }

  .section-title {
    display: block;
    flex: 1;
    margin: 0;
    padding-inline: 8px;
    color: var(--gray-500);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0;
    text-transform: uppercase;
  }

  .drawer-item {
    gap: 10px;
    min-height: 44px;
    padding: 9px 10px;
    border-radius: var(--radius-sm);
    color: var(--gray-700);
    font-size: 14px;
    font-weight: 800;
    text-decoration: none;
    transition:
      background var(--transition-fast),
      color var(--transition-fast);
  }

  .drawer-item:hover {
    color: var(--gray-900);
    background: var(--gray-100);
  }

  .drawer-item.is-disabled {
    border: 0;
    color: var(--gray-400);
    background: transparent;
    cursor: not-allowed;
    opacity: 0.72;
  }

  .drawer-item.is-disabled:hover {
    color: var(--gray-400);
    background: transparent;
  }

  .drawer-item.active {
    color: var(--BgWhite);
    background: var(--PrimaryColor);
  }

  .drawer-subgroup {
    gap: 8px;
    min-height: 32px;
    padding: 8px 6px 4px;
    color: var(--gray-500);
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
  }

  .drawer-subgroup__icon {
    display: grid;
    place-items: center;
    flex: 0 0 24px;
    width: 24px;
    height: 24px;
    border-radius: var(--radius-xs);
    background: var(--gray-100);
  }

  .drawer-subgroup__label {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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

  .drawer-item.active .item-icon {
    background: var(--white-alpha-20);
  }

  .icon,
  .item-icon :deep(svg) {
    width: 18px;
    height: 18px;
  }

  .item-label {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .badge {
    padding: 2px 6px;
    color: var(--BgWhite);
    background: var(--Red);
    border-radius: var(--radius-full);
    font-size: 10px;
  }

  .drawer-footer {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 14px;
    border-top: 1px solid var(--border-weak);
  }

  .user-card {
    gap: 10px;
    padding: 10px;
    border-radius: var(--radius-sm);
    background: var(--gray-50);
  }

  .user-card img {
    width: 36px;
    height: 36px;
  }

  .logout-btn {
    gap: 10px;
    width: 100%;
    min-height: 42px;
    padding: 9px 10px;
    border: 0;
    border-radius: var(--radius-sm);
    color: var(--danger);
    background: transparent;
    font-weight: 800;
    cursor: pointer;
  }

  .logout-btn:hover {
    color: var(--danger-dark);
    background: var(--danger-light);
  }

  .mobile-sidebar-fade-enter-active,
  .mobile-sidebar-fade-leave-active {
    transition: opacity var(--transition);
  }

  .mobile-sidebar-fade-enter-active .mobile-sidebar-drawer,
  .mobile-sidebar-fade-leave-active .mobile-sidebar-drawer {
    transition: transform var(--transition);
  }

  .mobile-sidebar-fade-enter-from,
  .mobile-sidebar-fade-leave-to {
    opacity: 0;
  }

  .mobile-sidebar-fade-enter-from .mobile-sidebar-drawer,
  .mobile-sidebar-fade-leave-to .mobile-sidebar-drawer {
    transform: translateX(-100%);
  }

  [dir='rtl'] .mobile-sidebar-fade-enter-from .mobile-sidebar-drawer,
  [dir='rtl'] .mobile-sidebar-fade-leave-to .mobile-sidebar-drawer {
    transform: translateX(100%);
  }
</style>

<style lang="scss">
  body.mobile-sidebar-open {
    overflow: hidden;
  }
</style>
