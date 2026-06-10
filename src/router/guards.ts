import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { useUserStore } from '@/stores/user';

export function authGuard(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext,
): void {
  const userData = useUserStore();

  if (to.path === '/choose-country' || to.path === '/not-found') {
    return next();
  }

  const isLoginPage = to.path === '/login';

  if (!userData.isAuth && !isLoginPage) {
    return next({ name: 'Choose Country' });
  }

  if (isLoginPage && userData.isAuth) {
    return next({ name: 'About' });
  }

  next();
}
