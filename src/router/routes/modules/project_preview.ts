import type { RouteRecordRaw } from '@/router/types';

export const ProjectPreviewRoutes: RouteRecordRaw[] = [
  {
    path: 'project_preview/add',
    name: 'add-project_preview',
    component: () =>
      import('@/views/MainOrganization/Project/ProjectPreview/AddProjectPreview.vue'),
    meta: {
      breadcrumb: 'Add project_preview',
      parent: 'project-preview',
    },
  },
  {
    path: 'project_preview/edit/:project_preview_id',
    name: 'edit-project_preview',
    component: () =>
      import('@/views/MainOrganization/Project/ProjectPreview/EditProjectPreview.vue'),
    props: true,
    meta: {
      breadcrumb: 'Edit project_preview',
      parent: 'project-preview',
    },
  },
];
