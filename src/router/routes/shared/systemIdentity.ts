import type { RouteRecordRaw } from '@/router/types';

export const SystemIdentityRoutes: RouteRecordRaw[] = [
  {
    path: 'system-identity',
    name: 'System Identity',
    component: () => import('@/views/shared/SystemIdentity/IndexSystemIdentity.vue'),
    meta: {
      breadcrumb: 'system_identity.title',
    },
  },
];
