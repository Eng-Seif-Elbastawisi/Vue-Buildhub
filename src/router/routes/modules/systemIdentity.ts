import type { RouteRecordRaw } from '@/router/types';

export const SystemIdentityRoutes: RouteRecordRaw[] = [
  {
    path: 'system-identity',
    name: 'System Identity',
    component: () => import('@/views/MainOrganization/SystemIdentity/SystemIdentity.vue'),
    meta: {
      breadcrumb: 'system_identity.title',
    },
  },
];
