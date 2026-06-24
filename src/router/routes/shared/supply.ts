import type { RouteRecordRaw } from '@/router/types';

export const supplyRoutes: RouteRecordRaw[] = [
  {
    path: 'supply',
    name: 'Supply',
    component: () => import('@/views/shared/supply/IndexSupply.vue'),
    meta: {
      breadcrumb: 'Supply',
    },
  },
  {
    path: 'supply/add',
    name: 'Add Supply',
    component: () => import('@/views/shared/supply/AddSupply.vue'),
    meta: {
      breadcrumb: 'Add Supply',
      parent: 'Supply',
    },
  },
  {
    path: 'supply/edit/:supply_id',
    name: 'Edit Supply',
    component: () => import('@/views/shared/supply/EditSupply.vue'),
    props: true,
    meta: {
      breadcrumb: 'Edit Supply',
      parent: 'Supply',
    },
  },
];
