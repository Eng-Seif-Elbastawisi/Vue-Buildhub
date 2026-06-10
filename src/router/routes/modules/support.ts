import type { RouteRecordRaw } from '@/router/types';

export const SupportContactsRoutes: RouteRecordRaw[] = [
  {
    path: 'support',
    name: 'Support',
    component: () => import('@/views/SupportContacts/IndexSupport.vue'),
    meta: {
      breadcrumb: 'Support',
    },
  },
  {
    path: 'support/add',
    name: 'Add Support',
    component: () => import('@/views/SupportContacts/AddSupport.vue'),
    meta: {
      breadcrumb: 'Add Support',
      parent: 'Support',
    },
  },
  {
    path: 'support/edit',
    name: 'Edit Support',
    component: () => import('@/views/SupportContacts/EditSupport.vue'),
    meta: {
      breadcrumb: 'Edit Support',
      parent: 'Support',
    },
  },
];
