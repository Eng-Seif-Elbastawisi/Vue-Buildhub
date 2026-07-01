import type { RouteRecordRaw } from '@/router/types';

export const ProjectTypeRoutes: RouteRecordRaw[] = [
  {
    path: 'projectType',
    name: 'Projects',
    component: () => import('@/views/shared/ProjectType/IndexProjectType.vue'),
    meta: { breadcrumb: 'Projects' },
  },
  {
    path: 'projectType/add',
    name: 'Add Project',
    component: () => import('@/views/shared/ProjectType/AddProjectType.vue'),
    meta: { breadcrumb: 'Add Project', parent: 'Projects' },
  },
  {
    path: 'projectType/edit/:project_id',
    name: 'Edit Project',
    component: () => import('@/views/shared/ProjectType/EditProjectType.vue'),
    props: true,
    meta: { breadcrumb: 'Edit Project', parent: 'Projects' },
  },
];
