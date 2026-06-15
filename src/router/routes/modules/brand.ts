import type { RouteRecordRaw } from '@/router/types';

export const BrandRoutes: RouteRecordRaw[] = [
  {
    path: 'brand',
    name: 'Brand',
    component: () => import('@/views/Brand/IndexBrand.vue'),
    meta: {
      breadcrumb: 'Brand',
    },
  },
  {
    path: 'brand/add',
    name: 'Add Brand',
    component: () => import('@/views/Brand/AddBrand.vue'),
    meta: {
      breadcrumb: 'Add Brand',
      parent: 'Brand',
    },
  },
  {
    path: 'brand/edit/:id?',
    name: 'Edit Brand',
    component: () => import('@/views/Brand/EditBrand.vue'),
    props: true,
    meta: {
      breadcrumb: 'Edit Brand',
      parent: 'Brand',
    },
  },
];
