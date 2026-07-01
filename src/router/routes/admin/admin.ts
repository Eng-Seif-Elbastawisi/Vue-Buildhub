import type { RouteRecordRaw } from '@/router/types';

export const adminCrudRoutes: RouteRecordRaw[] = [
  {
    path: 'admin',
    name: 'Admin',
    component: () => import('@/views/MainAdmin/Admin/IndexAdmin.vue'),
    meta: {
      breadcrumb: 'Admin',
    },
  },
  {
    path: 'admin/add',
    name: 'Add Admin',
    component: () => import('@/views/MainAdmin/Admin/AddAdmin.vue'),
    meta: {
      breadcrumb: 'Add Admin',
      parent: 'Admin',
    },
  },
  {
    path: 'admin/edit/:id',
    name: 'Edit Admin',
    component: () => import('@/views/MainAdmin/Admin/EditAdmin.vue'),
    props: true,
    meta: {
      breadcrumb: 'Edit Admin',
      parent: 'Admin',
    },
  },
];
