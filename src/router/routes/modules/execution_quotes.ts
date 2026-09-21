import type { RouteRecordRaw } from '@/router/types';

export const executionQuoteRoutes: RouteRecordRaw[] = [
  {
    path: 'execution-quotes',
    name: 'Execution Quotes',
    component: () => import('@/views/MainOrganization/ExecutionQuotes/IndexExecutionQuotes.vue'),
    meta: {
      breadcrumb: 'execution_quote.title',
    },
  },
  {
    path: 'execution-quotes/add',
    name: 'Add Execution Quote',
    component: () => import('@/views/MainOrganization/ExecutionQuotes/AddExecutionQuote.vue'),
    meta: {
      breadcrumb: 'execution_quote.new_quote',
      parent: 'execution_quote.title',
    },
  },
];
