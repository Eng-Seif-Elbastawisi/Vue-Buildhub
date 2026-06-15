import type { RouteRecordRaw } from '@/router/types';

export const ProjectRoutes: RouteRecordRaw[] = [
  {
    path: 'project',
    name: 'Projects',
    component: () => import('@/views/Project/IndexProject.vue'),
    meta: { breadcrumb: 'Projects' },
  },
  {
    path: 'project/add',
    name: 'Add Project',
    component: () => import('@/views/Project/AddProject.vue'),
    meta: { breadcrumb: 'Add Project', parent: 'Projects' },
  },
  {
    path: 'project/edit/:project_id',
    name: 'Edit Project',
    component: () => import('@/views/Project/EditProject.vue'),
    props: true,
    meta: { breadcrumb: 'Edit Project', parent: 'Projects' },
  },
];
