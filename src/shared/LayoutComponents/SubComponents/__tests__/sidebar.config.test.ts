import { describe, expect, it } from 'vitest';
import { sidebarSections } from '../sidebar.config';

describe('sidebarSections', () => {
  it('keeps sidebar sections configurable with items', () => {
    expect(sidebarSections.length).toBeGreaterThan(0);
    expect(sidebarSections[0]).toEqual(
      expect.objectContaining({
        key: expect.any(String),
        labelKey: expect.any(String),
        items: expect.any(Array),
      }),
    );
    expect(sidebarSections.flatMap((section) => section.items).length).toBeGreaterThan(0);
  });

  it('includes the organization system identity page in config', () => {
    const systemIdentityItem = sidebarSections
      .flatMap((section) => section.items)
      .find((item) => item.path === '/system-identity');

    expect(systemIdentityItem).toEqual(
      expect.objectContaining({
        labelKey: 'system_identity.title',
        roles: ['organization', 'admin'],
      }),
    );
  });

  it('includes the organization fetch toggle page in config', () => {
    const organizationToggleItem = sidebarSections
      .flatMap((section) => section.items)
      .find((item) => item.path === '/organization-toggle');

    expect(organizationToggleItem).toEqual(
      expect.objectContaining({
        labelKey: 'Organization',
        roles: ['organization'],
      }),
    );
  });
});
