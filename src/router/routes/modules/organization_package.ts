import { UserType } from '@/modules/auth/core/constants/userType.enum';
import type { RouteRecordRaw } from '@/router/types';

export const OrganizationPackageRoutes: RouteRecordRaw[] = [
  {
    path: 'packages',
    name: 'mainorganization-packages',
    component: () => import('@/views/MainOrganization/Package/OrganizationPackages.vue'),
    meta: {
      breadcrumb: 'organization_packages.packages',
      allowedUserTypes: [UserType.ORGANIZATION],
    },
  },
];
