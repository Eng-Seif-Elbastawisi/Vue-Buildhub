import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { useUserStore } from '@/stores/user';

const ROLE_PATHS: Record<number, string> = {
  1: '/admin',
  2: '/organization',
  3: '/supervision', // غيرها حسب اسم route بتاع النوع التالت
};

const PROTECTED_PREFIXES = ['/admin', '/organization', '/supervision'];

export function authGuard(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext,
): void {
  const userStore = useUserStore();

  const userType = Number(userStore.user?.type);
  const appPath = ROLE_PATHS[userType];

  const isLoginPage = to.path === '/login';
  const isProtectedPage = PROTECTED_PREFIXES.some((path) => to.path.startsWith(path));

  // مش عامل login أو type مش معروف
  if (!appPath) {
    if (isLoginPage) {
      return next();
    }

    return next({
      path: '/login',
      query: { redirect: to.fullPath },
    });
  }

  // لو عامل login وفتح login رجعه للداشبورد بتاعه
  if (isLoginPage) {
    return next({ path: appPath });
  }

  // لو داخل على protected route مش بتاع نوعه
  if (isProtectedPage && !to.path.startsWith(appPath)) {
    return next({ path: appPath });
  }

  return next();
}