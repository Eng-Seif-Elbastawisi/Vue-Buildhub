import type { RouteLocationNormalized } from 'vue-router';
import { useUserStore } from '@/stores/user';
// import { UserType } from '@/modules/auth/core/constants/userType.enum';
// import { hasUsableAuthToken } from '@/modules/auth/core/utils/authToken';

type RoleRouteAccess = {
  homePath: string;
  allowedPrefixes: string[];
};

const ROLE_ROUTE_ACCESS: Record<number, RoleRouteAccess> = {
  1: {
    homePath: '/admin',
    allowedPrefixes: ['/admin', '/mainportal'],
  },
  2: {
    homePath: '/organization',
    allowedPrefixes: ['/organization'],
  },
};

const LOGIN_PATHS = ['/login-admin', '/login-organization'];

const PROTECTED_PREFIXES = ['/admin', '/mainportal', '/organization'];

const DEFAULT_LOGIN_PATH = '/login-organization';

const startsWithPath = (path: string, prefix: string) => {
  return path === prefix || path.startsWith(`${prefix}/`);
};

export const isLoginPath = (path: string) => LOGIN_PATHS.includes(path);

export const getLoginPathByTarget = (path: string) => {
  if (startsWithPath(path, '/admin') || startsWithPath(path, '/mainportal')) {
    return '/login-admin';
  }

  return DEFAULT_LOGIN_PATH;
};

export function authGuard(to: RouteLocationNormalized) {
  const userStore = useUserStore();

  const userType = Number(userStore.user?.type);

  const routeAccess = ROLE_ROUTE_ACCESS[userType];

  const isLoginPage = isLoginPath(to.path);
  const isProtectedPage = PROTECTED_PREFIXES.some((prefix) => startsWithPath(to.path, prefix));

  // مش عامل login
  if (!routeAccess) {
    if (isLoginPage) return true;

    return getLoginPathByTarget(to.path);
  }

  if (isLoginPage) {
    return routeAccess.homePath;
  }

  // عامل login بس داخل path مش بتاع role بتاعه
  const canAccessProtectedPage = routeAccess.allowedPrefixes.some((prefix) =>
    startsWithPath(to.path, prefix),
  );

  if (isProtectedPage && !canAccessProtectedPage) {
    return routeAccess.homePath;
  }

  return true;
}
