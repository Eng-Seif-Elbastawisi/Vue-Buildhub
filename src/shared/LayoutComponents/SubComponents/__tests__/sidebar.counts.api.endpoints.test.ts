import { describe, expect, it } from 'vitest';

import {
  AdminSidebarCountsApiEndpoints,
  SidebarCountsApiEndpoints,
} from '../sidebar.counts.api.endpoints';

describe('SidebarCountsApiEndpoints', () => {
  it('configures organization sidebar counts endpoint', () => {
    const endpoints = new SidebarCountsApiEndpoints();

    expect(endpoints.organizationSidebarCounts).toContain('organization_sidebar_counts');
    expect(endpoints.organizationSidebarCounts).toContain('/organization/');
  });

  it('configures admin sidebar counts under the admin API prefix', () => {
    const endpoints = new AdminSidebarCountsApiEndpoints();

    expect(endpoints.adminSidebarCounts).toContain('/mainportal/admin_sidebar_counts');
  });
});
