import type { Router } from 'vue-router';
import { getLoginPathByTarget, isLoginPath } from '@/router/guards';
import { useUserStore } from '@/stores/user';

export const handleUnauthorizedResponse = (router: Router): void => {
  const currentPath = router.currentRoute.value.path;

  useUserStore().logout();

  if (isLoginPath(currentPath)) return;

  void router.replace(getLoginPathByTarget(currentPath));
};
