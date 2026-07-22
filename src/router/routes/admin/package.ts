import { UserType } from '@/modules/auth/core/constants/userType.enum';
import type { RouteRecordRaw } from '@/router/types';

export const packageCrudRoutes: RouteRecordRaw[] = [
  {
    path: 'package',
    name: 'Packages',
    component: () => import('@/views/MainAdmin/Package/IndexPackage.vue'),
    meta: {
      breadcrumb: 'Packages',
      allowedUserTypes: [UserType.ADMIN],
    },
  },
  {
    path: 'package/add',
    name: 'Add Package',
    component: () => import('@/views/MainAdmin/Package/AddPackage.vue'),
    meta: {
      breadcrumb: 'Add Package',
      parent: 'Packages',
      allowedUserTypes: [UserType.ADMIN],
    },
  },
  {
    path: 'package/edit/:id',
    name: 'Edit Package',
    component: () => import('@/views/MainAdmin/Package/EditPackage.vue'),
    props: true,
    meta: {
      breadcrumb: 'Edit Package',
      parent: 'Packages',
      allowedUserTypes: [UserType.ADMIN],
    },
  },
];
