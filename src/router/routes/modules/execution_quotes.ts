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
  {
    path: 'execution-quotes/show/:id(\\d+)',
    name: 'Show Execution Quote',
    component: () => import('@/views/MainOrganization/ExecutionQuotes/ShowExecutionQuote.vue'),
    meta: {
      breadcrumb: 'execution_quote.show.title',
      parent: 'execution_quote.title',
    },
  },
  {
    path: 'execution-quotes/add/stages/:stageId(\\d+)?',
    name: 'Build Execution Quote',
    component: () => import('@/views/MainOrganization/ExecutionQuotes/AddExecutionQuote.vue'),
    meta: {
      breadcrumb: 'execution_quote.steps.stages',
      parent: 'execution_quote.new_quote',
    },
  },
];
