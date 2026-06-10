import { createRouter, createWebHistory } from 'vue-router';
import { dashboardRoutes } from './routes/modules';
import { authGuard } from './guards';
import HomeIcon from '@/shared/icons/BreadcrumbIcons/HomeIcon.vue';

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
      name: 'Home App',
      component: () => import('@/views/AppLayout.vue'),
      // { path: '', redirect: { name: 'Countries' } },
      children: [ ...dashboardRoutes],
      meta: { icon: HomeIcon },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/not-found',
    },
  ],
});

router.beforeEach(authGuard);
export default router;
