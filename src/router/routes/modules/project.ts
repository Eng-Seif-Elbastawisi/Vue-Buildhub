import type { RouteRecordRaw } from '@/router/types';

export const ProjectRoutes: RouteRecordRaw[] = [
  {
    path: 'project',
    name: 'project',
    component: () => import('@/views/MainOrganization/Project/IndexProject.vue'),
    meta: {
      breadcrumb: 'project',
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
];
