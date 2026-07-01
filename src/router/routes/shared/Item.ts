import type { RouteRecordRaw } from '@/router/types';

export const itemRoutes: RouteRecordRaw[] = [
  {
    path: 'item',
    name: 'Item',
    component: () => import('@/views/shared/Item/Indexitem.vue'),
    meta: {
      breadcrumb: 'Item',
    },
  },
  {
    path: 'item/add',
    name: 'Add Item',
    component: () => import('@/views/shared/Item/AddItem.vue'),
    meta: {
      breadcrumb: 'Add Item',
      parent: 'Item',
    },
  },
  {
    path: 'item/edit/:id',
    name: 'Edit Item',
    component: () => import('@/views/shared/Item/EditItem.vue'),
    props: true,
    meta: {
      breadcrumb: 'Edit Item',
      parent: 'Item',
    },
  },
];
