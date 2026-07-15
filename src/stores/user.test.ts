import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';
import UserModel from '@/modules/auth/core/models/user.model';
import { UserType } from '@/modules/auth/core/constants/userType.enum';
import { USER_AUTH_STORAGE_KEY, useUserStore } from './user';

describe('user store logout', () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
  });

  it('removes only authentication state and preserves unrelated local storage', () => {
    const userStore = useUserStore();
    const user = new UserModel({
      name: 'Admin',
      email: 'admin@example.com',
      type: UserType.ADMIN,
      apiToken: 'test-token',
    });

    localStorage.setItem(USER_AUTH_STORAGE_KEY, JSON.stringify({ user }));
    localStorage.setItem('locale', 'ar');
    localStorage.setItem('organizationFetchToggleStatus', '1');
    userStore.setUser(user);

    userStore.logout();

    expect(userStore.user).toBeNull();
    expect(userStore.isAuth).toBe(false);
    expect(userStore.expiresAt).toBeNull();
    expect(localStorage.getItem(USER_AUTH_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem('locale')).toBe('ar');
    expect(localStorage.getItem('organizationFetchToggleStatus')).toBe('1');
  });
});
