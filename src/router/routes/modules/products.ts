import type { RouteRecordRaw } from '@/router/types';

export const ProductsRoutes: RouteRecordRaw[] = [
  {
    path: 'products',
    name: 'Products',
    component: () => import('@/views/MainOrganization/Products/IndexProducts.vue'),
    meta: {
      breadcrumb: 'Products',
    },
  },
  {
    path: 'products/add',
    name: 'Add Products',
    component: () => import('@/views/MainOrganization/Products/AddProducts.vue'),
    meta: {
      breadcrumb: 'Add Products',
      parent: 'Products',
    },
  },
  {
    path: 'products/edit/:products_id',
    name: 'Edit Products',
    component: () => import('@/views/MainOrganization/Products/EditProducts.vue'),
    props: true,
    meta: {
      breadcrumb: 'Edit Products',
      parent: 'Products',
    },
  },
];
