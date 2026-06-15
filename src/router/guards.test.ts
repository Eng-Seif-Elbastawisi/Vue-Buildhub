import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { authGuard } from './guards';

const mockUserStore = vi.hoisted(() => ({
  isAuth: false,
  user: null as { isMaster?: boolean } | null,
}));

vi.mock('@/stores/user', () => ({
  useUserStore: () => mockUserStore,
}));

const makeRoute = (path: string): RouteLocationNormalized => ({ path }) as RouteLocationNormalized;

describe('authGuard', () => {
  const next = vi.fn() as NavigationGuardNext;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUserStore.isAuth = false;
    mockUserStore.user = null;
  });

  it('redirects unauthenticated users to choose country', () => {
    authGuard(makeRoute('/organization/employees'), makeRoute('/'), next);

    expect(next).toHaveBeenCalledWith({ name: 'Choose Country' });
  });

  it('allows authenticated organization users into organization routes', () => {
    mockUserStore.isAuth = true;
    mockUserStore.user = { isMaster: false };

    authGuard(makeRoute('/organization/employees'), makeRoute('/login'), next);

    expect(next).toHaveBeenCalledWith();
  });

  it('redirects organization users away from admin routes', () => {
    mockUserStore.isAuth = true;
    mockUserStore.user = { isMaster: false };

    authGuard(makeRoute('/admin'), makeRoute('/login'), next);

    expect(next).toHaveBeenCalledWith({ path: '/organization' });
  });

  it('redirects master users away from organization routes', () => {
    mockUserStore.isAuth = true;
    mockUserStore.user = { isMaster: true };

    authGuard(makeRoute('/organization'), makeRoute('/login'), next);

    expect(next).toHaveBeenCalledWith({ path: '/admin' });
  });

  it('redirects authenticated users from login to their app', () => {
    mockUserStore.isAuth = true;
    mockUserStore.user = { isMaster: true };

    authGuard(makeRoute('/login'), makeRoute('/choose-country'), next);

    expect(next).toHaveBeenCalledWith({ path: '/admin' });
  });
});
