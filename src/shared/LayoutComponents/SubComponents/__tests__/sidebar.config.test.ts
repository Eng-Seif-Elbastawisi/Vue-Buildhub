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

  it('assigns an icon to every section and item', () => {
    expect(sidebarSections.every((section) => section.icon)).toBe(true);
    expect(sidebarSections.flatMap((section) => section.items).every((item) => item.icon)).toBe(
      true,
    );
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
        labelKey: 'organization_toggle.sidebar_label',
        roles: ['organization'],
      }),
    );
  });

  it('includes separate pending and converted project entries', () => {
    const items = sidebarSections.flatMap((section) => section.items);

    expect(items.find((item) => item.path === '/project')).toEqual(
      expect.objectContaining({
        labelKey: 'requests',
        roles: ['organization'],
      }),
    );
    expect(items.find((item) => item.path === '/project/add')).toEqual(
      expect.objectContaining({
        labelKey: 'Add request',
        roles: ['organization'],
      }),
    );
    expect(items.find((item) => item.path === '/converted-projects')).toEqual(
      expect.objectContaining({
        labelKey: 'design',
        roles: ['organization'],
      }),
    );
  });
});
