import type { RouteRecordRaw } from '@/router/types';

export const LaborRoutes: RouteRecordRaw[] = [
  {
    path: 'labor',
    name: 'Labor',
    component: () => import('@/views/MainOrganization/Laboor/IndexLabor.vue'),
    meta: {
      breadcrumb: 'labor.list_title',
    },
  },
  {
    path: 'labor/add',
    name: 'add_labor',
    component: () => import('@/views/MainOrganization/Laboor/AddLabor.vue'),
    meta: {
      breadcrumb: 'labor.add',
      parent: 'Labor',
    },
  },
  {
    path: 'labor/edit/:labor_id',
    name: 'edit_labor',
    component: () => import('@/views/MainOrganization/Laboor/EditLabor.vue'),
    props: true,
    meta: {
      breadcrumb: 'labor.update',
      parent: 'Labor',
    },
  },
];
