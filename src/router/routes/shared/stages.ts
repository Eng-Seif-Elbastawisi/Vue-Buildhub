import type { RouteRecordRaw } from '@/router/types';

export const stagesRoutes: RouteRecordRaw[] = [
  {
    path: 'stages',
    name: 'Stages',
    component: () => import('@/views/shared/Stages/IndexStage.vue'),
    meta: {
      breadcrumb: 'stage.execution_title',
    },
  },
  {
    path: 'stages/add',
    name: 'Add Stage',
    component: () => import('@/views/shared/Stages/AddStage.vue'),
    meta: {
      breadcrumb: 'Add Stage',
      parent: 'Stages',
    },
  },
  {
    path: 'stages/edit/:id',
    name: 'Edit Stage',
    component: () => import('@/views/shared/Stages/EditStage.vue'),
    props: true,
    meta: {
      breadcrumb: 'Edit Stage',
      parent: 'Stages',
    },
  },
];
