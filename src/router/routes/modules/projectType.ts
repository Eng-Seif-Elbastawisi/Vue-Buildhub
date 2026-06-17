import type { RouteRecordRaw } from '@/router/types';

export const ProjectTypeRoutes: RouteRecordRaw[] = [
  {
    path: 'projectType',
    name: 'Projects',
    component: () => import('@/views/ProjectType/IndexProjectType.vue'),
    meta: { breadcrumb: 'Projects' },
  },
  {
    path: 'projectType/add',
    name: 'Add Project',
    component: () => import('@/views/ProjectType/AddProjectType.vue'),
    meta: { breadcrumb: 'Add Project', parent: 'Projects' },
  },
  {
    path: 'projectType/edit/:project_id',
    name: 'Edit Project',
    component: () => import('@/views/ProjectType/EditProjectType.vue'),
    props: true,
    meta: { breadcrumb: 'Edit Project', parent: 'Projects' },
  },
];
