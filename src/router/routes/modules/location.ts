import type { RouteRecordRaw } from '@/router/types';

export const LocationRoutes: RouteRecordRaw[] = [
  {
    path: 'location',
    name: 'location',
    component: () => import('@/views/Location/IndexLocation.vue'),
    meta: {
      breadcrumb: 'location',
    },
  },
  {
    path: 'location/add',
    name: 'Add Location',
    component: () => import('@/views/Location/AddLocation.vue'),
    meta: {
      breadcrumb: 'Add Location',
      parent: 'location',
    },
  },
  {
    path: 'location/edit/:id',
    name: 'Edit Location',
    component: () => import('@/views/Location/EditLocation.vue'),
    props: true,
    meta: {
      breadcrumb: 'Edit Location',
      parent: 'location',
    },
  },
];
