import type { RouteLocationNormalized } from 'vue-router';
import { useUserStore } from '@/stores/user';

const ROLE_PATHS: Record<number, string> = {
  1: '/admin',
  2: '/organization',
};

const LOGIN_PATHS = ['/login-admin', '/login-organization'];

const PROTECTED_PREFIXES = ['/admin', '/organization'];

const DEFAULT_LOGIN_PATH = '/login-organization';

const startsWithPath = (path: string, prefix: string) => {
  return path === prefix || path.startsWith(`${prefix}/`);
};

const getLoginPathByTarget = (path: string) => {
  if (startsWithPath(path, '/admin')) {
    return '/login-admin';
  }

  return DEFAULT_LOGIN_PATH;
};

export function authGuard(to: RouteLocationNormalized) {
  const userStore = useUserStore();

  const userType = Number(userStore.user?.type);

  const userAppPath = ROLE_PATHS[userType];

  const isLoginPage = LOGIN_PATHS.includes(to.path);
  const isProtectedPage = PROTECTED_PREFIXES.some((prefix) => startsWithPath(to.path, prefix));

  // مش عامل login
  if (!userAppPath) {
    if (isLoginPage) return true;

    return getLoginPathByTarget(to.path);
  }

  // عامل login وبيحاول يدخل صفحة login
  if (isLoginPage) {
    return userAppPath;
  }

  // عامل login بس داخل path مش بتاع role بتاعه
  if (isProtectedPage && !startsWithPath(to.path, userAppPath)) {
    return userAppPath;
  }

  return true;
}
