import { describe, expect, it } from 'vitest';
import OrganizationApiService from '../organization.api-service';

describe('OrganizationApiService', () => {
  it('returns the same singleton instance', () => {
    expect(OrganizationApiService.getInstance()).toBe(OrganizationApiService.getInstance());
  });

  it('maps base API actions to organization endpoints', () => {
    const service = OrganizationApiService.getInstance() as unknown as {
      endpoints: Record<string, string>;
    };

    expect(service.endpoints.index).toContain('mainportal/fetch_organizations');
    expect(service.endpoints.create).toContain('mainportal/store_organization');
    expect(service.endpoints.update).toContain('mainportal/update_organization');
    expect(service.endpoints.delete).toContain('mainportal/delete_organization');
  });
});
