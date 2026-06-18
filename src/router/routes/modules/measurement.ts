import type { RouteRecordRaw } from '@/router/types';

export const measurementRoutes: RouteRecordRaw[] = [
  {
    path: 'measurement',
    name: 'Measurement',
    component: () => import('@/views/Measurement/IndexMeasurement.vue'),
    meta: {
      breadcrumb: 'Measurement',
    },
  },
  {
    path: 'measurement/add',
    name: 'Add Measurement',
    component: () => import('@/views/Measurement/AddMeasurement.vue'),
    meta: {
      breadcrumb: 'Add Measurement',
      parent: 'Measurement',
    },
  },
  {
    path: 'measurement/edit/:id',
    name: 'Edit Measurement',
    component: () => import('@/views/Measurement/EditMeasurement.vue'),
    props: true,
    meta: {
      breadcrumb: 'Edit Measurement',
      parent: 'Measurement',
    },
  },
];
