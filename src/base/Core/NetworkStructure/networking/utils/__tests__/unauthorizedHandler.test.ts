import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Router } from 'vue-router';
import { handleUnauthorizedResponse } from '../unauthorizedHandler';
import UserModel from '@/modules/auth/core/models/user.model';
import { UserType } from '@/modules/auth/core/constants/userType.enum';
import { useUserStore } from '@/stores/user';

const routerState = vi.hoisted(() => ({
  currentPath: '/organization/projects',
  replace: vi.fn(),
}));

const router = {
  currentRoute: {
    value: {
      get path() {
        return routerState.currentPath;
      },
    },
  },
  replace: routerState.replace,
} as unknown as Router;

describe('unauthorized response handling', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    routerState.currentPath = '/organization/projects';
    routerState.replace.mockClear();

    useUserStore().setUser(
      new UserModel({
        name: 'Organization User',
        email: 'user@example.com',
        type: UserType.ORGANIZATION,
        apiToken: 'test-token',
      }),
    );
  });

  it.each([
    ['/organization/projects', '/login-organization'],
    ['/admin/admin', '/login-admin'],
  ])('logs out and redirects %s to %s', (currentPath, loginPath) => {
    routerState.currentPath = currentPath;

    handleUnauthorizedResponse(router);

    expect(useUserStore().user).toBeNull();
    expect(useUserStore().isAuth).toBe(false);
    expect(routerState.replace).toHaveBeenCalledWith(loginPath);
  });

  it('does not redirect when a login request itself receives 401', () => {
    routerState.currentPath = '/login-organization';

    handleUnauthorizedResponse(router);

    expect(useUserStore().user).toBeNull();
    expect(useUserStore().isAuth).toBe(false);
    expect(routerState.replace).not.toHaveBeenCalled();
  });
});
