import type { RouteRecordRaw } from '@/router/types';

export const ProjectRoutes: RouteRecordRaw[] = [
  {
    path: 'project',
    name: 'project',
    component: () => import('@/views/MainOrganization/Project/IndexProject.vue'),
    meta: {
      breadcrumb: 'requests',
    },
  },
  {
    path: 'converted-projects',
    name: 'converted-projects',
    component: () => import('@/views/MainOrganization/Project/IndexConvertedProject.vue'),
    meta: {
      breadcrumb: 'Project',
    },
  },
  {
    path: 'offers-projects',
    name: 'offers-projects',
    component: () => import('@/views/MainOrganization/Project/IndexOfferProject.vue'),
    meta: {
      breadcrumb: 'Offer Project',
    },
  },

  {
    path: 'project/add',
    name: 'add-project',
    component: () => import('@/views/MainOrganization/Project/AddProject.vue'),
    meta: {
      breadcrumb: 'Add project',
      parent: 'project',
    },
  },
  {
    path: 'project/edit/:project_id',
    name: 'edit-project',
    component: () => import('@/views/MainOrganization/Project/EditProject.vue'),
    props: true,
    meta: {
      breadcrumb: 'Edit project',
      parent: 'project',
    },
  },
  {
    path: 'project/show/:project_id',
    name: 'show-project',
    component: () => import('@/views/MainOrganization/Project/ShowProject.vue'),
    props: true,
    meta: {
      breadcrumb: 'Show project',
      parent: 'project',
    },
  },
  {
    path: 'project/history/:project_id',
    name: 'project-history',
    component: () => import('@/views/MainOrganization/Project/ProjectHistory.vue'),
    props: true,
    meta: {
      breadcrumb: 'Project history',
      parent: 'project',
    },
  },
];
