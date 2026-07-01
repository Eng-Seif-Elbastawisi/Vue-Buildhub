import type { RouteRecordRaw } from '@/router/types';

export const departmentRoutes: RouteRecordRaw[] = [
  {
    path: 'departments',
    name: 'Departments',
    component: () => import('@/views/shared/Department/IndexDepartment.vue'),
    meta: { breadcrumb: 'Departments' },
  },
  {
    path: 'departments/add',
    name: 'Add Department',
    component: () => import('@/views/shared/Department/AddDepartment.vue'),
    meta: { breadcrumb: 'Add Department', parent: 'Departments' },
  },
  {
    path: 'departments/edit/:id',
    name: 'Edit Department',
    component: () => import('@/views/shared/Department/EditDepartment.vue'),
    meta: { breadcrumb: 'Edit Department', parent: 'Departments' },
  },
];
