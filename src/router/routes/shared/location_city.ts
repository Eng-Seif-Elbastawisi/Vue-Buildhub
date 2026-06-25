import type { RouteRecordRaw } from '@/router/types';

export const LocationCityRoutes: RouteRecordRaw[] = [
  {
    path: 'location-city',
    name: 'location-city',
    component: () => import('@/views/shared/Location/City/IndexLocation.vue'),
    meta: {
      breadcrumb: 'location-city',
    },
  },
  {
    path: 'location-city/add',
    name: 'Add Location City',
    component: () => import('@/views/shared/Location/City/AddLocation.vue'),
    meta: {
      breadcrumb: 'Add Location City',
      parent: 'location-city',
    },
  },
  {
    path: 'location-city/edit/:id',
    name: 'Edit Location City',
    component: () => import('@/views/shared/Location/City/EditLocation.vue'),
    props: true,
    meta: {
      breadcrumb: 'Edit Location City',
      parent: 'location-city',
    },
  },
];
