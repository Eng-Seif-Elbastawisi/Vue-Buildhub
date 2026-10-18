<script setup lang="ts">
  import { computed } from 'vue';
  import { storeToRefs } from 'pinia';

  import BuildHubLogo from '@/assets/images/BuildHubLogo.jpg';
  import EmployeeImage from '@/assets/images/headerIMages/employee.jpg';
  import HeaderSidebarIcon from '@/shared/icons/HeaderIcons/HeaderSidebarIcon.vue';
  import { useThemeStore } from '@/stores/theme';
  import { useLanguageSwitcher } from './useLanguageSwitcher';
  import { useUserStore } from '@/stores/user';
  import { useSystemIdentityTheme } from '@/modules/shared/SystemIdentity/presentation/composables/useSystemIdentityTheme';
  import GlobalProjectSearch from '@/modules/MainOrganization/Project/presentation/components/GlobalProjectSearch.vue';

  defineEmits<{
    (e: 'openSidebar'): void;
  }>();

  const themeStore = useThemeStore();
  const { currentLanguage, toggleLanguage } = useLanguageSwitcher();
  const userStore = useUserStore();
  const { user } = storeToRefs(userStore);
  const { currentPalette } = useSystemIdentityTheme();
  const brandLogo = computed(
    () => currentPalette.value.logo || user.value?.setting?.logo || BuildHubLogo,
  );
</script>

<template>
  <header class="mobile-topbar">
    <div class="mobile-brand">
      <img class="mobile-logo" :src="brandLogo" :alt="$t('buildhub_logo')" />
      <div class="mobile-copy">
        <strong>{{ $t('buildhub') }}</strong>
        <span>{{ $t('main_navigation') }}</span>
      </div>
    </div>

    <div class="mobile-actions">
      <GlobalProjectSearch compact />
      <button
        type="button"
        class="mobile-menu-btn"
        :aria-label="$t('toggle_theme')"
        :aria-pressed="themeStore.isDark"
        @click="themeStore.toggle"
      >
        <i :class="themeStore.isDark ? 'pi pi-sun' : 'pi pi-moon'" aria-hidden="true" />
      </button>
      <button
        type="button"
        class="mobile-menu-btn"
        :aria-label="$t('change_language')"
        @click="toggleLanguage"
      >
        {{ currentLanguage.toUpperCase() }}
      </button>
      <img class="mobile-avatar" :src="user?.image || EmployeeImage" :alt="$t('user')" />
      <button
        type="button"
        class="mobile-menu-btn"
        :aria-label="$t('open_sidebar')"
        @click="$emit('openSidebar')"
      >
        <HeaderSidebarIcon />
      </button>
    </div>
  </header>
</template>

<style scoped lang="scss">
  .mobile-topbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1400;
    display: none;
    align-items: center;
    justify-content: space-between;
    min-height: 64px;
    padding: 10px 14px;
    background: var(--BgWhite);
    border-bottom: 1px solid var(--border-weak);
    box-shadow: var(--shadow);
  }

  .mobile-brand,
  .mobile-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }

  .mobile-logo {
    width: 38px;
    height: 38px;
    object-fit: contain;
    border-radius: var(--radius-sm);
  }

  .mobile-copy {
    display: flex;
    flex-direction: column;
    min-width: 0;

    strong,
    span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    strong {
      color: var(--gray-900);
      font-size: 14px;
      font-weight: 800;
    }

    span {
      color: var(--gray-500);
      font-size: 11px;
      font-weight: 600;
    }
  }

  .mobile-avatar {
    width: 34px;
    height: 34px;
    border-radius: var(--radius-full);
    object-fit: cover;
  }

  .mobile-menu-btn {
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-sm);
    color: var(--PrimaryColor);
    background: var(--BgWhite);
    cursor: pointer;

    svg {
      fill: var(--PrimaryColor);
    }
  }

  @media (max-width: 1023px) {
    .mobile-topbar {
      display: flex;
    }
  }

  @media (max-width: 520px) {
    .mobile-avatar,
    .mobile-copy span {
      display: none;
    }

    .mobile-actions {
      gap: 6px;
    }

    .mobile-menu-btn {
      width: 36px;
      height: 36px;
    }

    .mobile-logo {
      width: 32px;
      height: 32px;
    }
  }
</style>
