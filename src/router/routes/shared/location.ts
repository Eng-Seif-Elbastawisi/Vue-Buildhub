import type { RouteRecordRaw } from '@/router/types';

export const LocationRoutes: RouteRecordRaw[] = [
  {
    path: 'location',
    name: 'location',
    component: () => import('@/views/shared/Location/IndexLocation.vue'),
    meta: {
      breadcrumb: 'location',
    },
  },
  {
    path: 'location/add',
    name: 'Add Location',
    component: () => import('@/views/shared/Location/AddLocation.vue'),
    meta: {
      breadcrumb: 'Add Location',
      parent: 'location',
    },
  },
  {
    path: 'location/edit/:id',
    name: 'Edit Location',
    component: () => import('@/views/shared/Location/EditLocation.vue'),
    props: true,
    meta: {
      breadcrumb: 'Edit Location',
      parent: 'location',
    },
  },
];
