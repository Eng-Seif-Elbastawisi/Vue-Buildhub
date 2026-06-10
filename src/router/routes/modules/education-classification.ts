import type { RouteRecordRaw } from '@/router/types';
import CountryIcon from '@/shared/icons/BreadcrumbIcons/CountryIcon.vue';

export const educationClassificationRoutes: RouteRecordRaw[] = [
  {
    path: 'education-classifications',
    name: 'EducationClassifications',
    component: () => import('@/views/EducationClassification/IndexEducationClassification.vue'),
    meta: {
      breadcrumb: 'Education tree configuration',
      icon: CountryIcon,
    },
  },
  // {
  //   path: 'education-classifications/add',
  //   name: 'Add Education Classification',
  //   component: () => import('@/views/EducationClassification/AddEducationClassification.vue'),
  //   meta: {
  //     breadcrumb: 'Add Education Classification',
  //     icon: CountryIcon,
  //     parent: 'Education Classifications',
  //   },
  // },
  // {
  //   path: 'education-classifications/edit/:id',
  //   name: 'Edit Education Classification',
  //   component: () => import('@/views/EducationClassification/EditEducationClassification.vue'),
  //   props: true,
  //   meta: {
  //     breadcrumb: 'Edit Education Classification',
  //     icon: CountryIcon,
  //     parent: 'Education Classifications',
  //   },
  // },
  {
    path: 'education-classifications-configuration/:id',
    name: 'Education Classifications Configuration',
    component: () =>
      import('@/views/EducationClassification/IndexEducationClassificationConfiguration.vue'),
    props: true,
    meta: {
      breadcrumb: 'Education Classifications Configuration',
      icon: CountryIcon,
      parent: 'Education Classifications',
    },
  },
  {
    path: 'education-classifications-tree/:id',
    name: 'Education Classifications Tree',
    component: () => import('@/views/EducationClassification/IndexEducationClassificationTree.vue'),
    props: true,
    meta: {
      breadcrumb: 'Education Classifications Tree',
      icon: CountryIcon,
      parent: 'Education Classifications',
    },
  },
];
