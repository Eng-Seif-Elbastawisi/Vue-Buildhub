import type { RouteRecordRaw } from '@/router/types';

export const ProjectFloorRoutes: RouteRecordRaw[] = [
  {
    path: 'project_floor/add',
    name: 'add-project_floor',
    component: () => import('@/views/MainOrganization/ProjectFloor/AddProjectFloor.vue'),
    meta: {
      breadcrumb: 'Add project_floor',
      parent: 'project-floor',
    },
  },
  {
    path: 'project_floor/edit/:project_floor_id',
    name: 'edit-project_floor',
    component: () => import('@/views/MainOrganization/ProjectFloor/EditProjectFloor.vue'),
    props: true,
    meta: {
      breadcrumb: 'Edit project_floor',
      parent: 'project-floor',
    },
  },
  {
    path: 'project_floor/show/:project_floor_id',
    name: 'show-project_floor',
    component: () => import('@/views/MainOrganization/ProjectFloor/ShowProjectFloor.vue'),
    props: true,
    meta: {
      breadcrumb: 'Show project_floor',
      parent: 'project-floor',
    },
  },
];
