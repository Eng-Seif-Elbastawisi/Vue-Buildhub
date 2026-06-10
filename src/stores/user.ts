import { defineStore } from 'pinia';
import { ref } from 'vue';
import type UserModel from '@/modules/auth/core/models/user.model';

let autoLogoutTimer: ReturnType<typeof setTimeout> | null = null;

export const useUserStore = defineStore(
  'user',
  () => {
    const user = ref<UserModel | null>(null);
    const isAuth = ref(false);
    const expiresAt = ref<number | null>(null);

    const setUser = (data: UserModel) => {
      user.value = data;
      isAuth.value = true;
      expiresAt.value = Date.now() + 24 * 60 * 60 * 1000;
      setAutoLogout();
    };

    const logout = () => {
      // Clear any pending auto-logout timer
      if (autoLogoutTimer) {
        clearTimeout(autoLogoutTimer);
        autoLogoutTimer = null;
      }
      user.value = null;
      isAuth.value = false;
      expiresAt.value = null;
      localStorage.clear();
    };

    const setAutoLogout = () => {
      // Clear any existing timer before setting a new one
      if (autoLogoutTimer) {
        clearTimeout(autoLogoutTimer);
        autoLogoutTimer = null;
      }

      if (expiresAt.value) {
        const timeout = expiresAt.value - Date.now();
        if (timeout > 0) {
          autoLogoutTimer = setTimeout(() => logout(), timeout);
        }
      }
    };

    const initFromPersist = () => {
      if (expiresAt.value && Date.now() > expiresAt.value) {
        logout();
      } else {
        setAutoLogout();
      }
    };

    return { user, isAuth, expiresAt, setUser, logout, setAutoLogout, initFromPersist };
  },
  {
    persist: {
      key: 'user',
      storage: localStorage,
    },
  },
);
