import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { RouteLocationNormalized } from 'vue-router';
import { authGuard } from './guards';

const mockUserStore = vi.hoisted(() => ({
  user: null as { type?: number } | null,
}));

vi.mock('@/stores/user', () => ({
  useUserStore: () => mockUserStore,
}));

const makeRoute = (path: string): RouteLocationNormalized => ({ path }) as RouteLocationNormalized;

describe('authGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUserStore.user = null;
  });

  it('redirects unauthenticated users to the target login page', () => {
    expect(authGuard(makeRoute('/organization/employees'))).toBe('/login-organization');
    expect(authGuard(makeRoute('/admin/employees'))).toBe('/login-admin');
    expect(authGuard(makeRoute('/mainportal/project/add'))).toBe('/login-admin');
  });

  it('allows authenticated organization users into organization routes', () => {
    mockUserStore.user = { type: 2 };

    expect(authGuard(makeRoute('/organization/employees'))).toBe(true);
  });

  it('redirects organization users away from admin routes', () => {
    mockUserStore.user = { type: 2 };

    expect(authGuard(makeRoute('/admin'))).toBe('/organization');
  });

  it('redirects admin users away from organization routes', () => {
    mockUserStore.user = { type: 1 };

    expect(authGuard(makeRoute('/organization'))).toBe('/admin');
  });

  it('allows admin users into mainportal dashboard aliases', () => {
    mockUserStore.user = { type: 1 };

    expect(authGuard(makeRoute('/mainportal/project/add'))).toBe(true);
    expect(authGuard(makeRoute('/mainportal/project_preview/add'))).toBe(true);
    expect(authGuard(makeRoute('/mainportal/project_floor/add'))).toBe(true);
  });

  it('redirects organization users away from mainportal aliases', () => {
    mockUserStore.user = { type: 2 };

    expect(authGuard(makeRoute('/mainportal/project/add'))).toBe('/organization');
  });

  it('redirects authenticated users from login to their app', () => {
    mockUserStore.user = { type: 1 };

    expect(authGuard(makeRoute('/login-admin'))).toBe('/admin');
  });
});
