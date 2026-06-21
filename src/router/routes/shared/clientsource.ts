import type { RouteRecordRaw } from '@/router/types';

export const ClientSourceRoutes: RouteRecordRaw[] = [
  {
    path: 'client-source',
    name: 'Client Source',
    component: () => import('@/views/shared/ClientSource/IndexClientSource.vue'),
    meta: {
      breadcrumb: 'Client Source',
    },
  },
  {
    path: 'client-source/add',
    name: 'Add Client Source',
    component: () => import('@/views/shared/ClientSource/AddClientSource.vue'),
    meta: {
      breadcrumb: 'Add Client Source',
      parent: 'Client Source',
    },
  },
  {
    path: 'client-source/edit/:id',
    name: 'Edit Client Source',
    component: () => import('@/views/shared/ClientSource/EditClientSource.vue'),
    props: true,
    meta: {
      breadcrumb: 'Edit Client Source',
      parent: 'Client Source',
    },
  },
];
