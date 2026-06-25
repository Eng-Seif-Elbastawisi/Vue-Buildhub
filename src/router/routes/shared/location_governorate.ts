import type { RouteRecordRaw } from '@/router/types';

export const LocationGovernorateRoutes: RouteRecordRaw[] = [
  {
    path: 'location-governorate',
    name: 'location-governorate',
    component: () => import('@/views/shared/Location/Governorate/IndexLocation.vue'),
    meta: {
      breadcrumb: 'location-governorate',
    },
  },
  {
    path: 'location-governorate/add',
    name: 'Add Location Governorate',
    component: () => import('@/views/shared/Location/Governorate/AddLocation.vue'),
    meta: {
      breadcrumb: 'Add Location Governorate',
      parent: 'location-governorate',
    },
  },
  {
    path: 'location-governorate/edit/:id',
    name: 'Edit Location Governorate',
    component: () => import('@/views/shared/Location/Governorate/EditLocation.vue'),
    props: true,
    meta: {
      breadcrumb: 'Edit Location Governorate',
      parent: 'location-governorate',
    },
  },
];
