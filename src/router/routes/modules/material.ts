import type { RouteRecordRaw } from '@/router/types';

export const MaterialRoutes: RouteRecordRaw[] = [
  {
    path: 'material',
    name: 'Material',
    component: () => import('@/views/Material/IndexMaterial.vue'),
    meta: {
      breadcrumb: 'Material',
    },
  },
  {
    path: 'material/add',
    name: 'Add Material',
    component: () => import('@/views/Material/AddMaterial.vue'),
    meta: {
      breadcrumb: 'Add Material',
      parent: 'Material',
    },
  },
  {
    path: 'material/edit/:material_id',
    name: 'Edit Material',
    component: () => import('@/views/Material/EditMaterial.vue'),
    props: true,
    meta: {
      breadcrumb: 'Edit Material',
      parent: 'Material',
    },
  },
];
