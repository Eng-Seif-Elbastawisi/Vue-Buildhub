import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { useUserStore } from '@/stores/user';

export function authGuard(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext,
): void {
  const userData = useUserStore();
  const isLoginPage = to.path === '/login';

  if (to.path === '/choose-country' || to.path === '/not-found') {
    return next();
  }

  if (!userData.isAuth) {
    return isLoginPage ? next() : next({ name: 'Choose Country' });
  }

  const appPath = userData.user?.isMaster ? '/admin' : '/organization';

  if (
    isLoginPage ||
    (to.path.startsWith('/admin') && appPath !== '/admin') ||
    (to.path.startsWith('/organization') && appPath !== '/organization')
  ) {
    return next({ path: appPath });
  }

  next();
}
