import type { RouteRecordRaw } from '@/router/types';

export const WarehouseRoutes: RouteRecordRaw[] = [
  {
    path: 'warehouse',
    name: 'Warehouse',
    component: () => import('@/views/MainOrganization/Warehouse/IndexWarehouse.vue'),
    meta: { breadcrumb: 'Warehouse' },
  },
  {
    path: 'warehouse/add',
    name: 'Add Warehouse',
    component: () => import('@/views/MainOrganization/Warehouse/AddWarehouse.vue'),
    meta: { breadcrumb: 'Add Warehouse', parent: 'Warehouse' },
  },
  {
    path: 'warehouse/edit/:warehouse_id',
    name: 'Edit Warehouse',
    component: () => import('@/views/MainOrganization/Warehouse/EditWarehouse.vue'),
    props: true,
    meta: { breadcrumb: 'Edit Warehouse', parent: 'Warehouse' },
  },
  {
    path: 'warehouse/show/:warehouse_id',
    name: 'Show Warehouse',
    component: () => import('@/views/MainOrganization/Warehouse/ShowWarehouse.vue'),
    props: true,
    meta: { breadcrumb: 'Show Warehouse', parent: 'Warehouse' },
  },
];
