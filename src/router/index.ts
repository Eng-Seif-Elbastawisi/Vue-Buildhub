import { createRouter, createWebHistory } from 'vue-router';
import { dashboardRoutes } from './routes/modules';
import { authGuard } from './guards';
import { adminRoutes } from './routes/admin';
import { addSuffix } from './helpers';
import { sharedRoutes } from './routes/shared';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/choose-country',
      name: 'Choose Country',
      component: () => import('@/views/auth/LoginCountry.vue'),
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/auth/LoginOrg.vue'),
    },
    {
      path: '/not-found',
      name: 'Not Found',
      component: () => import('@/views/error/Error.vue'),
    },
    {
      path: '/',
      redirect: '/organization',
    },
    {
      path: '/admin',
      name: 'dashboard',
      component: () => import('@/views/AppLayout.vue'),
      children: [...adminRoutes, ...addSuffix(sharedRoutes, 'Admin')],
    },
    {
      path: '/organization',
      name: 'Organization App',
      component: () => import('@/views/AppLayout.vue'),
      children: [...dashboardRoutes, ...addSuffix(sharedRoutes, 'Organization')],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/not-found',
    },
  ],
});

router.beforeEach(authGuard);
export default router;
