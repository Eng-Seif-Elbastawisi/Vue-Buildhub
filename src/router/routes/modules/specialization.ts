import type { RouteRecordRaw } from '@/router/types';

export const SpecializationRoutes: RouteRecordRaw[] = [
  {
    path: 'specialization',
    name: 'Specialization',
    component: () => import('@/views/MainOrganization/Specialization/IndexSpecialization.vue'),
    meta: {
      breadcrumb: 'Specialization',
    },
  },
  {
    path: 'specialization/add',
    name: 'Add Specialization',
    component: () => import('@/views/MainOrganization/Specialization/AddSpecialization.vue'),
    meta: {
      breadcrumb: 'Add Specialization',
      parent: 'Specialization',
    },
  },
  {
    path: 'specialization/edit/:specialization_id',
    name: 'Edit Specialization',
    component: () => import('@/views/MainOrganization/Specialization/EditSpecialization.vue'),
    props: true,
    meta: {
      breadcrumb: 'Edit Specialization',
      parent: 'Specialization',
    },
  },
];
