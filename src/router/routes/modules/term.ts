import type { RouteRecordRaw } from '@/router/types';

export const TermRoutes: RouteRecordRaw[] = [
  {
    path: 'term',
    name: 'Term',
    component: () => import('@/views/MainOrganization/Term/IndexTerm.vue'),
    meta: {
      breadcrumb: 'Term',
    },
  },
  {
    path: 'term/add',
    name: 'Add Term',
    component: () => import('@/views/MainOrganization/Term/AddTerm.vue'),
    meta: {
      breadcrumb: 'Add Term',
      parent: 'Term',
    },
  },
  {
    path: 'term/edit/:term_id',
    name: 'Edit Term',
    component: () => import('@/views/MainOrganization/Term/EditTerm.vue'),
    props: true,
    meta: {
      breadcrumb: 'Edit Term',
      parent: 'Term',
    },
  },
];
