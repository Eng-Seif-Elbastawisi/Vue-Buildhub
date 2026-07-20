<script lang="ts" setup>
  import { computed, onMounted, ref, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import IconLogout from '@/shared/icons/IconLogout.vue';
  import { useUserStore } from '@/stores/user';
  import SearchIcon from '@/shared/icons/SearchIcon.vue';
  import HeaderSettingIcon from '@/shared/icons/HeaderIcons/HeaderSettingIcon.vue';
  import HeaderMessgaesIcon from '@/shared/icons/HeaderIcons/HeaderMessgaesIcon.vue';
  import HeaderNotificationIcon from '@/shared/icons/HeaderIcons/HeaderNotificationIcon.vue';
  import EmployeeImage from '@/assets/images/headerIMages/employee.jpg';
  import { useRouter } from 'vue-router';
  import Drawer from 'primevue/drawer';
  import SidebarNavigation from './SidebarNavigation.vue';
  import HeaderSidebarIcon from '@/shared/icons/HeaderIcons/HeaderSidebarIcon.vue';
  import { useRouteSearch } from '@/stores/routerSearch';
  import { UserType } from '@/modules/auth/core/constants/userType.enum';

  const userStore = useUserStore();
  const router = useRouter();
  const { user } = useUserStore();
  const { locale } = useI18n();

  type Language = 'ar' | 'en';

  const languageStorageKey = 'locale';
  const languageFlags: Record<Language, string> = {
    ar: '🇪🇬',
    en: '🇺🇸',
  };

  const languageLabels: Record<Language, string> = {
    ar: 'Switch language to Arabic',
    en: 'Switch language to English',
  };

  const currentLanguage = computed<Language>(() => (locale.value === 'ar' ? 'ar' : 'en'));
  const nextLanguage = computed<Language>(() => (currentLanguage.value === 'ar' ? 'en' : 'ar'));
  const flagLabel = computed(() => languageLabels[nextLanguage.value]);
  const flagIcon = computed(() => languageFlags[nextLanguage.value]);

  const setLanguage = (lang: Language) => {
    locale.value = lang;
    localStorage.setItem(languageStorageKey, lang);

    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.body.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  const toggleLanguage = () => {
    setLanguage(locale.value === 'ar' ? 'en' : 'ar');
  };

  const currentRole = computed(() => {
    return user?.type === UserType.ADMIN ? 'mainportal' : 'organization';
  });

  const logout = () => {
    const loginPath = currentRole.value === 'mainportal' ? '/login-admin' : '/login-organization';

    userStore.logout();
    router.push(loginPath);
  };

  const isDropMenuOpen = ref(false);
  const toggleDropMenu = () => {
    isDropMenuOpen.value = !isDropMenuOpen.value;
  };

  const DrawerVisible = ref(false);
  const { query, results, isOpen, activeIndex, navigate, onKeydown } = useRouteSearch();

  watch(results, (val) => {
    isOpen.value = val.length > 0;
    activeIndex.value = -1;
  });

  onMounted(() => {
    const savedLocale = localStorage.getItem(languageStorageKey);
    setLanguage(savedLocale === 'en' || savedLocale === 'ar' ? savedLocale : 'ar');
  });
</script>

<template>
  <header class="header">
    <nav class="nav">
      <div class="search" @keydown="onKeydown">
        <SearchIcon />
        <input
          v-model="query"
          type="search"
          :placeholder="$t('search_what_you_want')"
          autocomplete="off"
        />

        <Transition name="dropdown">
          <ul v-if="isOpen" class="search__results">
            <li
              v-for="(route, index) in results"
              :key="route.name"
              :class="{ 'is-active': index === activeIndex }"
              @mouseenter="activeIndex = index"
              @mousedown.prevent="navigate(route)"
            >
              {{ route.title }}
            </li>
          </ul>
        </Transition>
      </div>

      <div class="setting">
        <HeaderNotificationIcon class="cursor-pointer" />
        <!-- <HeaderMessgaesIcon class="cursor-pointer" /> -->
        <!-- <HeaderSettingIcon class="cursor-pointer" /> -->
        <button
          class="language-toggle"
          type="button"
          :aria-label="flagLabel"
          :title="flagLabel"
          @click="toggleLanguage"
        >
          <span aria-hidden="true">{{ flagIcon }}</span>
        </button>

        <div class="user cursor-pointer dropdown-trigger">
          <img :alt="$t('user')" :src="EmployeeImage" @click="toggleDropMenu" />

          <transition name="mega-menu">
            <div v-if="isDropMenuOpen" class="mega-menu">
              <div class="mega-header">
                <img
                  :src="EmployeeImage || `https://cyber.comolho.com/static/img/avatar.png`"
                  :alt="$t('image')"
                />
                <div>
                  <p class="name">{{ user?.name }}</p>
                  <span class="role">{{ $t('Admin') }}</span>
                </div>
              </div>

              <div class="divider"></div>

              <div class="mega-actions">
                <button class="logout-btn" @click="logout">
                  <icon-logout />
                  <span>{{ $t('logout') }}</span>
                </button>
              </div>
            </div>
          </transition>
        </div>

        <div class="sidebar-drawer">
          <button class="cursor-pointer" @click="DrawerVisible = true">
            <HeaderSidebarIcon />
          </button>
          <Drawer v-model:visible="DrawerVisible" position="right">
            <template #header> </template>
            <SidebarNavigation @click-item="DrawerVisible = false" />
          </Drawer>
        </div>
      </div>
    </nav>
  </header>
</template>

<style scoped lang="scss">
  .search {
    position: relative;

    &__results {
      position: absolute;
      top: calc(100% + 8px);
      left: 0;
      right: 0;
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
      list-style: none;
      margin: 0;
      padding: 4px;
      z-index: 99999;

      li {
        padding: 8px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        transition: background 0.15s;

        &.is-active,
        &:hover {
          background: #f1f5f9;
        }
      }
    }
  }

  .language-toggle {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border: 1px solid var(--border-weak);
    background: var(--BgWhite);
    cursor: pointer;
    font-size: 20px;
    line-height: 1;
    padding: 0;
  }

  .dropdown-enter-active,
  .dropdown-leave-active {
    transition:
      opacity 0.15s,
      transform 0.15s;
  }

  .dropdown-enter-from,
  .dropdown-leave-to {
    opacity: 0;
    transform: translateY(-4px);
  }
</style>
