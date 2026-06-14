import type { RouteRecordRaw } from '@/router/types';

export const SuppliersRoutes: RouteRecordRaw[] = [
  {
    path: 'suppliers',
    name: 'Suppliers',
    component: () => import('@/views/Suppliers/IndexSuppliers.vue'),
    meta: {
      breadcrumb: 'Suppliers',
    },
  },
  {
    path: 'suppliers/add',
    name: 'Add Suppliers',
    component: () => import('@/views/Suppliers/AddSuppliers.vue'),
    meta: {
      breadcrumb: 'Add Suppliers',
      parent: 'Suppliers',
    },
  },
  {
    path: 'suppliers/edit/:id',
    name: 'Edit Suppliers',
    component: () => import('@/views/Suppliers/EditSuppliers.vue'),
    props: true,
    meta: {
      breadcrumb: 'Edit Suppliers',
      parent: 'Suppliers',
    },
  },
];
