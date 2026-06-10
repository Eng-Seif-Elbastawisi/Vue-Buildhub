import type { RouteRecordRaw } from '@/router/types';

export const DeletedAccountsRoutes: RouteRecordRaw[] = [
  {
    path: 'deleted-accounts',
    name: 'Deleted Accounts',
    component: () => import('@/views/deletedAccounts/indexDeletedAccounts.vue'),
    meta: {
      breadcrumb: 'Deleted Accounts',
    },
  },

];
