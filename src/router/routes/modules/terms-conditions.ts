import type { RouteRecordRaw } from '@/router/types';

export const termsConditionsRoutes: RouteRecordRaw[] = [
  {
    path: 'terms-conditions',
    name: 'TermsConditions',
    component: () => import('@/views/TermsConditions/TermsConditionsIndex.vue'),
    meta: {
      breadcrumb: 'TermsConditions',
    },
  },
  {
    path: 'terms-conditions/add',
    name: 'Add TermsConditions',
    component: () => import('@/views/TermsConditions/TermsConditionsAdd.vue'),
    meta: {
      breadcrumb: 'Add TermsConditions',
    },
  },
];
