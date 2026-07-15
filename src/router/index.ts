import { createRouter, createWebHistory } from 'vue-router';
import { dashboardRoutes } from './routes/modules';
import { authGuard } from './guards';
import { adminRoutes } from './routes/admin';
import { addSuffix } from './helpers';
import { sharedRoutes } from './routes/shared';
import { UserType } from '@/modules/auth/core/constants/userType.enum';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login-organization',
      name: 'Login Organization',
      component: () => import('@/views/MainOrganization/auth_organization/LoginOrganization.vue'),
    },
    {
      path: '/login-admin',
      name: 'Login Admin',
      component: () => import('@/views/MainAdmin/auth_admin/LoginAdmin.vue'),
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
      meta: { allowedUserTypes: [UserType.ADMIN] },
      children: [...adminRoutes, ...addSuffix(sharedRoutes, 'Admin')],
    },
    {
      path: '/organization',
      alias: '/mainportal',
      name: 'Organization App',
      component: () => import('@/views/AppLayout.vue'),
      meta: { allowedUserTypes: [UserType.ORGANIZATION] },
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
