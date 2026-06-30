import type { RouteRecordRaw } from '@/router/types';

export const projectItemRoutes: RouteRecordRaw[] = [
  {
    path: 'project-item',
    name: 'Project Item',
    component: () => import('@/views/shared/ProjectItem/IndexProjectItem.vue'),
    meta: {
      breadcrumb: 'Project Item',
    },
  },
  {
    path: 'project-item/add',
    name: 'Add Project Item',
    component: () => import('@/views/shared/ProjectItem/AddProjectItem.vue'),
    meta: {
      breadcrumb: 'Add Project Item',
      parent: 'Project Item',
    },
  },
  {
    path: 'project-item/edit/:id',
    name: 'Edit Project Item',
    component: () => import('@/views/shared/ProjectItem/EditProjectItem.vue'),
    props: true,
    meta: {
      breadcrumb: 'Edit Project Item',
      parent: 'Project Item',
    },
  },
];
