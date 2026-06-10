import type { RouteRecordRaw } from '@/router/types';
import EmployeeIcon from '@/shared/icons/BreadcrumbIcons/EmployeeIcon.vue';

export const PackagesRoutes: RouteRecordRaw[] = [
  {
    path: 'packages',
    name: 'Packages',
    component: () => import('@/views/Packages/IndexPackages.vue'),
    meta: {
      breadcrumb: 'Packages',
      icon: EmployeeIcon,
    },
  },
  {
    path: 'packages/add',
    name: 'Add package',
    component: () => import('@/views/Packages/AddPackages.vue'),
    meta: {
      breadcrumb: 'add package',
      icon: EmployeeIcon,
      parent: 'Packages',
    },
  },
  {
    path: 'packages/edit/:id',
    name: 'Edit package',
    component: () => import('@/views/Packages/EditPackages.vue'),
    props: true,
    meta: {
      breadcrumb: 'Edit package',
      icon: EmployeeIcon,
      parent: 'Packages',
    },
  },
  {
    path: 'packages/show/:id',
    name: 'Show package',
    component: () => import('@/views/Packages/ShowPackages.vue'),
    props: true,
    meta: {
      breadcrumb: 'package details',
      icon: EmployeeIcon,
      parent: 'Packages',
    },
  },
];
