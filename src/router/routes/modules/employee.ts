import type { RouteRecordRaw } from '@/router/types';
import EmployeeIcon from '@/shared/icons/BreadcrumbIcons/EmployeeIcon.vue';

export const employeeRoutes: RouteRecordRaw[] = [
  {
    path: 'employees',
    name: 'Employees',
    component: () => import('@/views/Employee/IndexEmployee.vue'),
    meta: {
      breadcrumb: 'Employees',
      icon: EmployeeIcon,
    },
  },
  {
    path: 'employees/add',
    name: 'Add Employee',
    component: () => import('@/views/Employee/AddEmployee.vue'),
    meta: {
      breadcrumb: 'Add Employee',
      icon: EmployeeIcon,
      parent: 'Employees',
    },
  },
  {
    path: 'employees/edit/:id',
    name: 'Edit Employee',
    component: () => import('@/views/Employee/EditEmployee.vue'),
    props: true,
    meta: {
      breadcrumb: 'Edit Employee',
      icon: EmployeeIcon,
      parent: 'Employees',
    },
  },
];
