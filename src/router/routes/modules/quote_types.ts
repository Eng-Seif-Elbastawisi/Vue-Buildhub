import type { RouteRecordRaw } from '@/router/types';

export const quoteTypesRoutes: RouteRecordRaw[] = [
  // =========================
  // MainOrganization Quote Types
  // =========================

  {
    path: 'quote-types',

    name: 'Quote Types',

    component: () => import('@/views/MainOrganization/QuoteTypes/IndexQuoteType.vue'),

    meta: {
      breadcrumb: 'quote_type.list_title',
    },
  },

  {
    path: 'quote-types/add',

    name: 'Add Quote Type',

    component: () => import('@/views/MainOrganization/QuoteTypes/AddQuoteType.vue'),

    meta: {
      breadcrumb: 'quote_type.add',

      parent: 'quote_type.list_title',
    },
  },

  {
    path: 'quote-types/edit/:id',

    name: 'Edit Quote Type',

    component: () => import('@/views/MainOrganization/QuoteTypes/EditQuoteType.vue'),

    props: true,

    meta: {
      breadcrumb: 'quote_type.update',

      parent: 'quote_type.list_title',
    },
  },
];
