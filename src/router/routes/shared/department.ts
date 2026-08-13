import type { RouteRecordRaw } from '@/router/types';
import type { RouteLocationNormalizedLoaded } from 'vue-router';
import { DepartmentTypeEnum } from '@/modules/shared/Department/core/constants/Type.enum';

const departmentBreadcrumb = (route: RouteLocationNormalizedLoaded) => {
  const queryType = Array.isArray(route.query.type) ? route.query.type[0] : route.query.type;

  if (Number(queryType) === DepartmentTypeEnum.DESIGN) {
    return { labelKey: 'department.design_title' };
  }

  if (Number(queryType) === DepartmentTypeEnum.SUPERVISION) {
    return { labelKey: 'department.execution_title' };
  }

  return { labelKey: 'Departments' };
};

export const departmentRoutes: RouteRecordRaw[] = [
  {
    path: 'departments',
    name: 'Departments',
    component: () => import('@/views/shared/Department/IndexDepartment.vue'),
    meta: { breadcrumb: departmentBreadcrumb },
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
