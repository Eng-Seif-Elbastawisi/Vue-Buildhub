<script lang="ts" setup>
  import { ref, watch } from 'vue';
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

  const userStore = useUserStore();
  const router = useRouter();

  const logout = () => {
    userStore.logout();
    router.push('/login');
  };

  const isDropMenuOpen = ref(false);
  const toggleDropMenu = () => {
    isDropMenuOpen.value = !isDropMenuOpen.value;
  };

  const DrawerVisible = ref(false);
  const { user } = useUserStore();

  const { query, results, isOpen, activeIndex, navigate, onKeydown } = useRouteSearch();

  watch(results, (val) => {
    isOpen.value = val.length > 0;
    activeIndex.value = -1;
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
          placeholder="Search What You Want"
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
        <HeaderMessgaesIcon class="cursor-pointer" />
        <HeaderSettingIcon class="cursor-pointer" />

        <div class="user cursor-pointer dropdown-trigger">
          <img alt="user" :src="EmployeeImage" @click="toggleDropMenu" />

          <transition name="mega-menu">
            <div v-if="isDropMenuOpen" class="mega-menu">
              <div class="mega-header">
                <img
                  :src="EmployeeImage || `https://cyber.comolho.com/static/img/avatar.png`"
                  alt="image"
                />
                <div>
                  <p class="name">{{ user?.name }}</p>
                  <span class="role">Admin</span>
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
