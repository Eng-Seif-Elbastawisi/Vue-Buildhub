import type { RouteRecordRaw } from '@/router/types';

export const SpaceRoutes: RouteRecordRaw[] = [
  {
    path: 'space',
    name: 'Space',
    component: () => import('@/views/shared/Space/IndexSpace.vue'),
    meta: {
      breadcrumb: 'Space',
    },
  },
  {
    path: 'space/add',
    name: 'Add Space',
    component: () => import('@/views/shared/Space/AddSpace.vue'),
    meta: {
      breadcrumb: 'Add Space',
      parent: 'Space',
    },
  },
  {
    path: 'space/edit/:space_id',
    name: 'Edit Space',
    component: () => import('@/views/shared/Space/EditSpace.vue'),
    props: true,
    meta: {
      breadcrumb: 'Edit Space',
      parent: 'Specialization',
    },
  },
];
