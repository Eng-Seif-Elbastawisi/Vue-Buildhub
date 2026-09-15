import type { RouteRecordRaw } from '@/router/types';

export const stagesRoutes: RouteRecordRaw[] = [
  // =========================
  // Main Stages
  // =========================

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

  {
    path: 'stages/:parent_id/sub-stages',
    name: 'Sub Stages',
    component: () => import('@/views/shared/Stages/SubStages/IndexSubStage.vue'),
    props: true,
    meta: {
      breadcrumb: 'Sub Stages',
      parent: 'Stages',
    },
  },

  {
    path: 'stages/:parent_id/sub-stages/add',
    name: 'Add Sub Stage',
    component: () => import('@/views/shared/Stages/SubStages/AddSubStage.vue'),
    props: true,
    meta: {
      breadcrumb: 'Add Sub Stage',
      parent: 'Sub Stages',
    },
  },

  {
    path: 'stages/:parent_id/sub-stages/edit/:id',
    name: 'Edit Sub Stage',
    component: () => import('@/views/shared/Stages/SubStages/EditSubStage.vue'),
    props: true,
    meta: {
      breadcrumb: 'Edit Sub Stage',
      parent: 'Sub Stages',
    },
  },
];
