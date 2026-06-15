import type { RouteRecordRaw } from '@/router/types';

export const termRoutes: RouteRecordRaw[] = [
  {
    path: 'terms',
    name: 'Terms',
    component: () => import('@/views/Term/IndexTerm.vue'),
    meta: { breadcrumb: 'Terms' },
  },
  {
    path: 'terms/add',
    name: 'Add Term',
    component: () => import('@/views/Term/AddTerm.vue'),
    meta: { breadcrumb: 'Add Term', parent: 'Terms' },
  },
  {
    path: 'terms/edit/:id',
    name: 'Edit Term',
    component: () => import('@/views/Term/EditTerm.vue'),
    meta: { breadcrumb: 'Edit Term', parent: 'Terms' },
  },
];
