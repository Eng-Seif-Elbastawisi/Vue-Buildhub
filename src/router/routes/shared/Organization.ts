import type { RouteRecordRaw } from '@/router/types';

export const organizationRoutes: RouteRecordRaw[] = [
  {
    path: 'organization',
    name: 'Organization',
    component: () => import('@/views/shared/organization/IndexOrganization.vue'),
    meta: {
      breadcrumb: 'Organization',
    },
  },
  {
    path: 'organization/add',
    name: 'Add Organization',
    component: () => import('@/views/shared/organization/AddOrganization.vue'),
    meta: {
      breadcrumb: 'Add Organization',
      parent: 'Organization',
    },
  },
  {
    path: 'organization/edit/:id',
    name: 'Edit Organization',
    component: () => import('@/views/shared/organization/EditOrganization.vue'),
    props: true,
    meta: {
      breadcrumb: 'Edit Organization',
      parent: 'Organization',
    },
  },
  {
    path: 'organization-toggle',
    name: 'Organization Toggle',
    component: () => import('@/views/MainOrganization/Organization/OrganizationToggle.vue'),
    meta: {
      breadcrumb: 'organization_toggle.title',
    },
  },
];
