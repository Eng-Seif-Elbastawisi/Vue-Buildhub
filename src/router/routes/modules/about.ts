import type { RouteRecordRaw } from '@/router/types';

export const AboutRoutes: RouteRecordRaw[] = [
  {
    path: 'about',
    name: 'About',
    component: () => import('@/views/About/IndexAbout.vue'),
    meta: {
      breadcrumb: 'About',
    },
  },
  {
    path: 'about/add',
    name: 'Add About',
    component: () => import('@/views/About/AddAbout.vue'),
    meta: {
      breadcrumb: 'Add About',
      parent: 'About',
    },
  },
  {
    path: 'about/edit',
    name: 'Edit About',
    component: () => import('@/views/About/EditAbout.vue'),
    props: true,
    meta: {
      breadcrumb: 'Edit About',
      parent: 'About',
    },
  },
];
