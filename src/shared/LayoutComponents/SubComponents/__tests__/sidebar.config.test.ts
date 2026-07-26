import { describe, expect, it } from 'vitest';
import { InvoiceStatusEnum } from '@/modules/MainOrganization/Invoice/core/constant/invoice.status.enum';
import { DepartmentTypeEnum } from '@/modules/shared/Department/core/constants/Type.enum';
import { ItemServiceTypeEnum } from '@/modules/shared/Item/core/constant/item.service.type.enum';
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

  it('includes an admin-only packages destination', () => {
    const packageItem = sidebarSections
      .flatMap((section) => section.items)
      .find((item) => item.path === '/package');

    expect(packageItem).toEqual(
      expect.objectContaining({
        labelKey: 'sidebar.packages',
        roles: ['admin'],
      }),
    );
  });

  it('links project workspaces and task assignment destinations', () => {
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

    expect(
      items.find(
        (item) =>
          item.path ===
          `/converted-projects?service_type=${DepartmentTypeEnum.DESIGN},${DepartmentTypeEnum.BOTH}`,
      ),
    ).toEqual(
      expect.objectContaining({
        labelKey: 'sidebar.design_projects',
        roles: ['organization'],
      }),
    );
    expect(items.some((item) => item.path === '/project-pricing')).toBe(false);
    expect(items.find((item) => item.path === '/task-assignment')).toEqual(
      expect.objectContaining({
        labelKey: 'sidebar.task_assignment',
        roles: ['organization'],
      }),
    );
  });

  it('links paid and unpaid invoices to the invoice page with status filters', () => {
    const items = sidebarSections.flatMap((section) => section.items);
    const paidInvoices = items.find((item) => item.labelKey === 'sidebar.paid_invoices');
    const unpaidInvoices = items.find((item) => item.labelKey === 'sidebar.unpaid_invoices');

    expect(paidInvoices).toEqual(
      expect.objectContaining({
        path: `/invoice?status=${InvoiceStatusEnum.PAID}`,
      }),
    );
    expect(paidInvoices?.disabled).toBeUndefined();

    expect(unpaidInvoices).toEqual(
      expect.objectContaining({
        path: `/invoice?status=${InvoiceStatusEnum.UNPAID}`,
      }),
    );
    expect(unpaidInvoices?.disabled).toBeUndefined();
  });

  it('links design and construction items to the item page with service type filters', () => {
    const itemPaths = sidebarSections
      .flatMap((section) => section.items)
      .filter((item) => item.labelKey === 'sidebar.items')
      .map((item) => item.path);

    expect(itemPaths).toEqual(
      expect.arrayContaining([
        `/item?service_type=${ItemServiceTypeEnum.DESIGN}`,
        `/item?service_type=${ItemServiceTypeEnum.SUPERVISION}`,
      ]),
    );
  });
});
