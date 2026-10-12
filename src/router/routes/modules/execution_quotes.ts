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
  {
    path: 'execution-quotes/show/:id(\\d+)/site-team',
    name: 'Quote Site Team',
    component: () => import('@/views/MainOrganization/ExecutionQuotes/SiteTeam/SiteTeamIndex.vue'),
    meta: { breadcrumb: 'site_team.title', parent: 'execution_quote.show.title' },
  },
  {
    path: 'execution-quotes/show/:id(\\d+)/schedule',
    name: 'Quote Schedule',
    component: () => import('@/views/MainOrganization/ExecutionQuotes/Schedule/ScheduleIndex.vue'),
    meta: { breadcrumb: 'schedule.title', parent: 'execution_quote.show.title' },
  },
  {
    path: 'execution-quotes/show/:id(\\d+)/schedule/add',
    name: 'Add Schedule Group',
    component: () =>
      import('@/views/MainOrganization/ExecutionQuotes/Schedule/ScheduleGroupAdd.vue'),
    meta: { breadcrumb: 'schedule.title', parent: 'execution_quote.show.title' },
  },
  {
    path: 'execution-quotes/show/:id(\\d+)/schedule/:groupId(\\d+)',
    name: 'Show Schedule Group',
    component: () =>
      import('@/views/MainOrganization/ExecutionQuotes/Schedule/ScheduleGroupShow.vue'),
    meta: { breadcrumb: 'schedule.title', parent: 'execution_quote.show.title' },
  },
  {
    path: 'execution-quotes/show/:id(\\d+)/schedule/:groupId(\\d+)/edit',
    name: 'Edit Schedule Group',
    component: () =>
      import('@/views/MainOrganization/ExecutionQuotes/Schedule/ScheduleGroupEdit.vue'),
    meta: { breadcrumb: 'schedule.title', parent: 'execution_quote.show.title' },
  },
];
