import type { RouteRecordRaw } from '@/router/types';

export const EmployeeRoutes: RouteRecordRaw[] = [
  {
    path: 'employee',
    name: 'Employee',
    component: () => import('@/views/MainOrganization/employee/IndexEmployee.vue'),
    meta: {
      breadcrumb: 'Employee',
    },
  },
  {
    path: 'employee/add',
    name: 'Add Employee',
    component: () => import('@/views/MainOrganization/employee/AddEmployee.vue'),
    meta: {
      breadcrumb: 'Add Employee',
      parent: 'Employee',
    },
  },
  {
    path: 'employee/edit/:employee_id',
    name: 'Edit Employee',
    component: () => import('@/views/MainOrganization/employee/EditEmployee.vue'),
    props: true,
    meta: {
      breadcrumb: 'Edit Employee',
      parent: 'Employee',
    },
  },
];
