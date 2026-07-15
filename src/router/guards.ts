import type { RouteLocationNormalized } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { UserType } from '@/modules/auth/core/constants/userType.enum';
import { hasUsableAuthToken } from '@/modules/auth/core/utils/authToken';

const ROLE_PATHS: Record<UserType, string> = {
  [UserType.ADMIN]: '/admin',
  [UserType.ORGANIZATION]: '/organization',
};

const LOGIN_PATHS = ['/login-admin', '/login-organization'];

const PROTECTED_PREFIXES = ['/admin', '/organization'];

const DEFAULT_LOGIN_PATH = '/login-organization';

const startsWithPath = (path: string, prefix: string) => {
  return path === prefix || path.startsWith(`${prefix}/`);
};

export const isLoginPath = (path: string) => LOGIN_PATHS.includes(path);

export const getLoginPathByTarget = (path: string) => {
  if (startsWithPath(path, '/admin')) {
    return '/login-admin';
  }

  return DEFAULT_LOGIN_PATH;
};

export function authGuard(to: RouteLocationNormalized) {
  const userStore = useUserStore();
  const userType = Number(userStore.user?.type) as UserType;
  const hasAuthenticatedSession = userStore.isAuth && hasUsableAuthToken(userStore.user?.apiToken);
  const userAppPath = hasAuthenticatedSession ? ROLE_PATHS[userType] : undefined;
  const isLoginPage = isLoginPath(to.path);
  const isProtectedPage = PROTECTED_PREFIXES.some((prefix) => startsWithPath(to.path, prefix));

  if (!userAppPath) {
    if (isLoginPage) return true;

    return getLoginPathByTarget(to.path);
  }

  if (isLoginPage) {
    return userAppPath;
  }

  if (to.meta.allowedUserTypes && !to.meta.allowedUserTypes.includes(userType)) {
    return userAppPath;
  }

  if (isProtectedPage && !startsWithPath(to.path, userAppPath)) {
    return userAppPath;
  }

  return true;
}
