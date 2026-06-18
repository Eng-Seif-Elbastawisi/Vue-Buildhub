import type { RouteRecordRaw } from '@/router/types';

export const organizationRoutes: RouteRecordRaw[] = [
  {
    path: 'organization',
    name: 'Organization',
    component: () => import('@/views/organization/IndexOrganization.vue'),
    meta: {
      breadcrumb: 'Organization',
    },
  },
  {
    path: 'organization/add',
    name: 'Add Organization',
    component: () => import('@/views/organization/AddOrganization.vue'),
    meta: {
      breadcrumb: 'Add Organization',
      parent: 'Organization',
    },
  },
  {
    path: 'organization/edit/:id',
    name: 'Edit Organization',
    component: () => import('@/views/organization/EditOrganization.vue'),
    props: true,
    meta: {
      breadcrumb: 'Edit Organization',
      parent: 'Organization',
    },
  },
];
