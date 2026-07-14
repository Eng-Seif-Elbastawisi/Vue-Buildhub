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

  it('uses the requested sidebar section order', () => {
    expect(sidebarSections.map((section) => section.labelKey)).toEqual([
      'sidebar.crm',
      'sidebar.design_offers',
      'sidebar.design_projects',
      'sidebar.accounting',
      'sidebar.reports',
      'sidebar.sys_config',
      'sidebar.sys_identity',
    ]);
  });

  it('keeps the sys config group order', () => {
    const sysConfig = sidebarSections.find((section) => section.key === 'sys-config');

    expect(
      sysConfig?.items.filter((item) => item.type === 'group').map((item) => item.labelKey),
    ).toEqual([
      'sidebar.general_setting',
      'sidebar.locations_setup',
      'sidebar.design_config',
      'sidebar.construction_config',
    ]);
  });

  it('does not create pathless enabled links', () => {
    const pathlessItems = sidebarSections
      .flatMap((section) => section.items)
      .filter((item) => !item.path);

    expect(pathlessItems.every((item) => item.type === 'group' || item.disabled)).toBe(true);
  });

  it('marks unavailable sidebar destinations as disabled', () => {
    const disabledLabels = sidebarSections
      .flatMap((section) => section.items)
      .filter((item) => item.disabled)
      .map((item) => item.labelKey);

    expect(disabledLabels).toEqual(
      expect.arrayContaining([
        'sidebar.hold',
        'sidebar.canceled',
        'sidebar.plan',
        'sidebar.in_progress',
        'sidebar.full_packages',
        'sidebar.paid_invoices',
        'sidebar.unpaid_invoices',
        'sidebar.collection',
        'sidebar.upcoming_payment',
        'sidebar.productivity',
      ]),
    );
  });

  it('includes the organization system identity page in config', () => {
    const systemIdentityItem = sidebarSections
      .flatMap((section) => section.items)
      .find((item) => item.path === '/system-identity?section=colors');

    expect(systemIdentityItem).toEqual(
      expect.objectContaining({
        labelKey: 'sidebar.sys_colors',
        roles: ['organization', 'admin'],
      }),
    );
  });

  it('includes separate pending and converted project entries', () => {
    const items = sidebarSections.flatMap((section) => section.items);

    expect(items.find((item) => item.path === '/project')).toEqual(
      expect.objectContaining({
        labelKey: 'sidebar.requests',
        roles: ['organization'],
      }),
    );
    expect(items.find((item) => item.path === '/project/add')).toEqual(
      expect.objectContaining({
        labelKey: 'sidebar.add_request',
        roles: ['organization'],
      }),
    );
    expect(items.find((item) => item.path === '/converted-projects')).toEqual(
      expect.objectContaining({
        labelKey: 'sidebar.project',
        roles: ['organization'],
      }),
    );
  });
});
