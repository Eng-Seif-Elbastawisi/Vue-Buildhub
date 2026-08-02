<script lang="ts" setup>
  import { computed, onMounted, ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import IconLogout from '@/shared/icons/IconLogout.vue';
  import { useUserStore } from '@/stores/user';
  import EmployeeImage from '@/assets/images/headerIMages/employee.jpg';
  import { useRouter } from 'vue-router';
  import { UserType } from '@/modules/auth/core/constants/userType.enum';
  import { useSystemIdentityTheme } from '@/modules/shared/SystemIdentity/presentation/composables/useSystemIdentityTheme';
  import GlobalProjectSearch from '@/modules/MainOrganization/Project/presentation/components/GlobalProjectSearch.vue';

  const userStore = useUserStore();
  const router = useRouter();
  const { locale } = useI18n();
  const { currentPalette } = useSystemIdentityTheme();
  const user = computed(() => userStore.user);

  type Language = 'ar' | 'en';

  const languageStorageKey = 'locale';
  const languageLabels: Record<Language, string> = {
    ar: 'Switch language to Arabic',
    en: 'Switch language to English',
  };

  const currentLanguage = computed<Language>(() => (locale.value === 'ar' ? 'ar' : 'en'));
  const nextLanguage = computed<Language>(() => (currentLanguage.value === 'ar' ? 'en' : 'ar'));
  const flagLabel = computed(() => languageLabels[nextLanguage.value]);
  const paletteStyle = computed(() => ({
    '--palette-primary': currentPalette.value.primary,
    '--palette-secondary': currentPalette.value.secondary,
    '--palette-accent': currentPalette.value.accent,
  }));

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
    return user.value?.type === UserType.ADMIN ? 'mainportal' : 'organization';
  });
  const roleLabel = computed(() => (currentRole.value === 'mainportal' ? 'Admin' : 'Organization'));
  const avatarSource = computed(() => user.value?.image || EmployeeImage);

  const logout = () => {
    const loginPath = currentRole.value === 'mainportal' ? '/login-admin' : '/login-organization';

    userStore.logout();
    router.push(loginPath);
  };

  const isDropMenuOpen = ref(false);
  const toggleDropMenu = () => {
    isDropMenuOpen.value = !isDropMenuOpen.value;
  };

  onMounted(() => {
    const savedLocale = localStorage.getItem(languageStorageKey);
    setLanguage(savedLocale === 'en' || savedLocale === 'ar' ? savedLocale : 'ar');
  });
</script>

<template>
  <header class="header" :style="paletteStyle">
    <span class="navbar-glass-layer" aria-hidden="true"></span>

    <nav class="nav">
      <GlobalProjectSearch class="navbar-project-search" />

      <div class="setting">
        <button
          class="nav-action language-toggle"
          type="button"
          :aria-label="flagLabel"
          :title="flagLabel"
          @click="toggleLanguage"
        >
          <i class="pi pi-globe" aria-hidden="true"></i>
          <span aria-hidden="true">{{ currentLanguage.toUpperCase() }}</span>
          <i class="pi pi-chevron-down language-toggle__arrow" aria-hidden="true"></i>
        </button>

        <div class="user dropdown-trigger">
          <button
            type="button"
            class="profile-trigger"
            :aria-label="$t('user')"
            :aria-expanded="isDropMenuOpen"
            @click="toggleDropMenu"
          >
            <img :alt="$t('user')" :src="avatarSource" />

            <span class="profile-data">
              <strong>{{ user?.name }}</strong>
              <small>{{ $t(roleLabel) }}</small>
            </span>

            <i class="pi pi-chevron-down profile-trigger__arrow" aria-hidden="true"></i>
          </button>

          <transition name="mega-menu">
            <div v-if="isDropMenuOpen" class="mega-menu">
              <div class="mega-header">
                <img :src="avatarSource" :alt="$t('image')" />
                <div>
                  <p class="name">{{ user?.name }}</p>
                  <span class="role">{{ $t(roleLabel) }}</span>
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
      </div>
    </nav>
  </header>
</template>

<style scoped lang="scss">
  .header {
    position: sticky;
    inset-block-start: 12px;
    z-index: 1100;
    isolation: isolate;
    width: auto;
    min-height: 76px;
    margin-block: 12px;
    margin-inline: 20px;
    padding: 10px 14px;
    border: 1px solid color-mix(in sRGB, var(--palette-primary) 16%, transparent);
    border-radius: 20px;
    background-color: var(--BgWhite);
    background-image: linear-gradient(
      color-mix(in sRGB, var(--BgWhite) 34%, transparent),
      color-mix(in sRGB, var(--BgWhite) 34%, transparent)
    );
    // url('@/assets/images/ChatGPT Image Jul 20, 2026, 03_12_15 PM.png');
    // background-repeat: no-repeat;
    // background-position: center 37%;
    // background-size: cover;
    box-shadow: 0 14px 34px color-mix(in sRGB, var(--palette-secondary) 9%, transparent);
  }

  @supports ((backdrop-filter: blur(18px)) or (-webkit-backdrop-filter: blur(18px))) {
    .header {
      background-color: color-mix(in sRGB, var(--BgWhite) 82%, transparent);
      backdrop-filter: blur(18px) saturate(132%);
      -webkit-backdrop-filter: blur(18px) saturate(132%);
    }
  }

  .navbar-glass-layer {
    position: absolute;
    inset: 0;
    z-index: -1;
    overflow: hidden;
    border-radius: inherit;
    pointer-events: none;

    &::before {
      position: absolute;
      inset-block: -70%;
      inset-inline-start: -35%;
      width: 42%;
      content: '';
      background: linear-gradient(
        112deg,
        transparent 10%,
        color-mix(in sRGB, var(--palette-primary) 8%, transparent) 42%,
        color-mix(in sRGB, var(--palette-accent) 12%, transparent) 52%,
        transparent 86%
      );
      filter: blur(12px);
      transform: skewX(-16deg);
      animation: navbar-glass-wave 5.5s ease-in-out infinite;
    }
  }

  .nav,
  .setting,
  .profile-trigger,
  .profile-data {
    min-width: 0;
  }

  .nav {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    width: 100%;
  }

  .setting {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    gap: 8px;
  }

  .nav-action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 42px;
    height: 42px;
    padding: 0;
    border: 1px solid transparent;
    border-radius: 12px;
    color: var(--gray-700);
    background: transparent;
    transition:
      color var(--transition-fast),
      border-color var(--transition-fast),
      background var(--transition-fast),
      transform var(--transition-fast);
  }

  button.nav-action {
    cursor: pointer;
  }

  .nav-action:hover,
  .nav-action:focus-visible,
  .profile-trigger:hover,
  .profile-trigger:focus-visible {
    border-color: color-mix(in sRGB, var(--palette-primary) 18%, transparent);
    background: color-mix(in sRGB, var(--palette-primary) 8%, transparent);
  }

  .nav-action:focus-visible,
  .profile-trigger:focus-visible {
    outline: 3px solid color-mix(in sRGB, var(--palette-primary) 24%, transparent);
    outline-offset: 2px;
  }

  .nav-action:active,
  .profile-trigger:active {
    transform: translateY(1px);
  }

  .navbar-project-search {
    flex: 0 1 470px;
    width: min(470px, 48vw);
  }

  .language-toggle {
    gap: 7px;
    min-width: 76px;
    padding-inline: 10px;
    color: var(--gray-700);
    font-size: 12px;
    font-weight: 700;

    .pi-globe {
      color: var(--palette-primary);
      font-size: 17px;
    }

    &__arrow {
      color: var(--gray-400);
      font-size: 9px;
    }
  }

  .user {
    position: relative;
    margin-inline-start: 6px;
    padding-inline-start: 14px;
    border-inline-start: 1px solid
      color-mix(in sRGB, var(--palette-primary) 13%, var(--border-weak));
  }

  .profile-trigger {
    display: flex;
    align-items: center;
    gap: 10px;
    max-width: 230px;
    min-height: 48px;
    padding-block: 3px;
    padding-inline: 4px 8px;
    border: 1px solid transparent;
    border-radius: 14px;
    color: inherit;
    background: transparent;
    cursor: pointer;
    transition:
      border-color var(--transition-fast),
      background var(--transition-fast),
      transform var(--transition-fast);

    img {
      flex: 0 0 44px;
      width: 44px;
      height: 44px;
      border: 2px solid color-mix(in sRGB, var(--palette-primary) 22%, transparent);
      border-radius: 50%;
      object-fit: cover;
    }

    &__arrow {
      margin-inline-start: 4px;
      color: var(--gray-400);
      font-size: 10px;
    }
  }

  .profile-data {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    text-align: start;

    strong,
    small {
      display: block;
      max-width: 128px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    strong {
      color: var(--gray-900);
      font-size: 13px;
      font-weight: 700;
    }

    small {
      color: var(--gray-500);
      font-size: 10px;
      font-weight: 600;
    }
  }

  .header .setting .user .mega-menu {
    position: absolute;
    inset-block-start: calc(100% + 12px);
    inset-inline-end: 0;
    z-index: 1000;
    width: 230px;
    padding: 12px;
    border: 1px solid color-mix(in sRGB, var(--palette-primary) 14%, var(--border-weak));
    border-radius: 16px;
    background: var(--BgWhite);
    box-shadow: 0 18px 38px color-mix(in sRGB, var(--palette-secondary) 14%, transparent);

    .mega-header {
      display: flex;
      align-items: center;
      gap: 10px;

      img {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
      }

      .name {
        margin: 0;
        color: var(--gray-900);
        font-size: 14px;
        font-weight: 700;
      }

      .role {
        color: var(--gray-500);
        font-size: 11px;
      }
    }

    .divider {
      height: 1px;
      margin-block: 10px;
      background: color-mix(in sRGB, var(--palette-primary) 11%, var(--border-weak));
    }

    .logout-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 9px;
      border: 0;
      border-radius: 10px;
      color: var(--gray-700);
      background: transparent;
      cursor: pointer;
      transition:
        color var(--transition-fast),
        background var(--transition-fast);

      &:hover,
      &:focus-visible {
        color: var(--btn-red);
        background: color-mix(in sRGB, var(--btn-red) 8%, transparent);
      }
    }
  }

  .mega-menu-enter-active,
  .mega-menu-leave-active {
    transition:
      opacity var(--transition-fast),
      transform var(--transition-fast);
  }

  .mega-menu-enter-from,
  .mega-menu-leave-to {
    opacity: 0;
    transform: translateY(-8px) scale(0.98);
  }

  @keyframes navbar-glass-wave {
    0%,
    4% {
      transform: translate3d(-35%, 0, 0) skewX(-16deg);
    }

    82%,
    100% {
      transform: translate3d(350%, 0, 0) skewX(-16deg);
    }
  }

  @media (max-width: 1280px) {
    .header {
      margin-inline: 16px;
      padding-inline: 12px;
    }

    .nav {
      gap: 12px;
    }

    .navbar-project-search {
      flex-basis: 360px;
      width: min(360px, 42vw);
    }

    .profile-data small {
      display: none;
    }

    .profile-trigger {
      max-width: 190px;
    }
  }

  @media (max-width: 1100px) {
    .header {
      margin-inline: 12px;
    }

    .navbar-project-search {
      flex: 1 1 240px;
      width: auto;
    }

    .profile-data,
    .profile-trigger__arrow {
      display: none;
    }

    .profile-trigger {
      padding: 2px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .navbar-glass-layer::before {
      animation: none;
    }

    .nav-action,
    .profile-trigger,
    .navbar-project-search {
      transition: none;
    }
  }
</style>
