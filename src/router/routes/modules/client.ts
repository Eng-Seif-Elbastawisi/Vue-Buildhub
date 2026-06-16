import type { RouteRecordRaw } from '@/router/types';

export const ClientRoutes: RouteRecordRaw[] = [
  {
    path: 'client',
    name: 'Client',
    component: () => import('@/views/Client/IndexClient.vue'),
    meta: {
      breadcrumb: 'Client',
    },
  },
  {
    path: 'client/add',
    name: 'Add Client',
    component: () => import('@/views/Client/AddClient.vue'),
    meta: {
      breadcrumb: 'Add Client',
      parent: 'Client',
    },
  },
  {
    path: 'client/edit/:client_id',
    name: 'Edit Client',
    component: () => import('@/views/Client/EditClient.vue'),
    props: true,
    meta: {
      breadcrumb: 'Edit Client',
      parent: 'Client',
    },
  },
];
