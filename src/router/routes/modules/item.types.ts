import type { RouteRecordRaw } from '@/router/types';

export const ItemTypesRoutes: RouteRecordRaw[] = [
  {
    path: 'item_types',
    name: 'ItemTypes',
    component: () => import('@/views/MainOrganization/ItemTypes/IndexItemTypes.vue'),
    meta: {
      breadcrumb: 'ItemTypes',
    },
  },
  {
    path: 'item_types/add',
    name: 'Add ItemTypes',
    component: () => import('@/views/MainOrganization/ItemTypes/AddItemTypes.vue'),
    meta: {
      breadcrumb: 'Add ItemTypes',
      parent: 'ItemTypes',
    },
  },
  {
    path: 'item_types/edit/:item_types_id',
    name: 'Edit ItemTypes',
    component: () => import('@/views/MainOrganization/ItemTypes/EditItemTypes.vue'),
    props: true,
    meta: {
      breadcrumb: 'Edit ItemTypes',
      parent: 'ItemTypes',
    },
  },
];
