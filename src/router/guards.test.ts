import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { RouteLocationNormalized } from 'vue-router';
import { authGuard } from './guards';
import { UserType } from '@/modules/auth/core/constants/userType.enum';

const mockUserStore = vi.hoisted(() => ({
  user: null as { type?: number; apiToken?: string } | null,
  isAuth: false,
}));

vi.mock('@/stores/user', () => ({
  useUserStore: () => mockUserStore,
}));

const makeRoute = (
  path: string,
  allowedUserTypes?: readonly (typeof UserType)[keyof typeof UserType][],
): RouteLocationNormalized =>
  ({ path, meta: { allowedUserTypes } }) as unknown as RouteLocationNormalized;

const authenticateAs = (type: (typeof UserType)[keyof typeof UserType]) => {
  mockUserStore.user = { type, apiToken: 'test-token' };
  mockUserStore.isAuth = true;
};

describe('authGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUserStore.user = null;
    mockUserStore.isAuth = false;
  });

  it('redirects unauthenticated users to the target login page', () => {
    expect(authGuard(makeRoute('/organization/employees'))).toBe('/login-organization');
    expect(authGuard(makeRoute('/admin/employees'))).toBe('/login-admin');
    expect(authGuard(makeRoute('/mainportal/project/add'))).toBe('/login-admin');
  });

  it('allows authenticated organization users into organization routes', () => {
    authenticateAs(UserType.ORGANIZATION);

    expect(authGuard(makeRoute('/organization/employees'))).toBe(true);
  });

  it('redirects organization users away from admin routes', () => {
    authenticateAs(UserType.ORGANIZATION);

    expect(authGuard(makeRoute('/admin'))).toBe('/organization');
  });

  it('redirects admin users away from organization routes', () => {
    authenticateAs(UserType.ADMIN);

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
    authenticateAs(UserType.ADMIN);

    expect(authGuard(makeRoute('/login-admin'))).toBe('/admin');
  });

  it('rejects a persisted user that has no usable token', () => {
    mockUserStore.user = { type: UserType.ADMIN, apiToken: 'undefined' };
    mockUserStore.isAuth = true;

    expect(authGuard(makeRoute('/admin'))).toBe('/login-admin');
  });

  it('rejects a persisted user that has no recognized user type', () => {
    mockUserStore.user = { apiToken: 'test-token' };
    mockUserStore.isAuth = true;

    expect(authGuard(makeRoute('/admin'))).toBe('/login-admin');
  });

  it('blocks organization users from admin-only routes under their prefix', () => {
    authenticateAs(UserType.ORGANIZATION);

    expect(authGuard(makeRoute('/organization/admin', [UserType.ADMIN]))).toBe('/organization');
  });
});
