import type { RouteRecordRaw } from '@/router/types';
import { UserType } from '@/modules/auth/core/constants/userType.enum';

export const adminCrudRoutes: RouteRecordRaw[] = [
  {
    path: 'admin',
    name: 'Admin',
    component: () => import('@/views/MainAdmin/Admin/IndexAdmin.vue'),
    meta: {
      breadcrumb: 'Admin',
      allowedUserTypes: [UserType.ADMIN],
    },
  },
  {
    path: 'admin/add',
    name: 'Add Admin',
    component: () => import('@/views/MainAdmin/Admin/AddAdmin.vue'),
    meta: {
      breadcrumb: 'Add Admin',
      parent: 'Admin',
      allowedUserTypes: [UserType.ADMIN],
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
      allowedUserTypes: [UserType.ADMIN],
    },
  },
];
