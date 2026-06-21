import { describe, expect, it } from 'vitest';
import { OrganizationEndpoints } from '../organization.api.endpoints';

describe('OrganizationEndpoints', () => {
  it('uses dashboard organization endpoints', () => {
    const endpoints = new OrganizationEndpoints();

    expect(endpoints.index).toContain('dashboard/fetch_organizations');
    expect(endpoints.show).toContain('dashboard/show_organization');
    expect(endpoints.store).toContain('dashboard/store_organization');
    expect(endpoints.update).toContain('dashboard/update_organization');
    expect(endpoints.delete).toContain('dashboard/delete_organization');
  });
});
