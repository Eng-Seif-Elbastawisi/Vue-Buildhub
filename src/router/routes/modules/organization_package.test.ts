import { describe, expect, it } from 'vitest';
import { UserType } from '@/modules/auth/core/constants/userType.enum';
import { OrganizationPackageRoutes } from './organization_package';

describe('OrganizationPackageRoutes', () => {
  it('registers an organization-only packages page', () => {
    expect(OrganizationPackageRoutes).toEqual([
      expect.objectContaining({
        path: 'packages',
        name: 'mainorganization-packages',
        meta: expect.objectContaining({
          breadcrumb: 'organization_packages.packages',
          allowedUserTypes: [UserType.ORGANIZATION],
        }),
      }),
    ]);
  });
});
