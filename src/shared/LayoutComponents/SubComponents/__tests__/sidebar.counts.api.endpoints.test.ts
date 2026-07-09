import { describe, expect, it } from 'vitest';

import { SidebarCountsApiEndpoints } from '../sidebar.counts.api.endpoints';

describe('SidebarCountsApiEndpoints', () => {
  it('configures organization sidebar counts endpoint', () => {
    const endpoints = new SidebarCountsApiEndpoints();

    expect(endpoints.organizationSidebarCounts).toContain('organization_sidebar_counts');
  });
});
