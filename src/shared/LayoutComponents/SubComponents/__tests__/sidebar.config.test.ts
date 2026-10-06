import { describe, expect, it } from 'vitest';
import { InvoiceStatusEnum } from '@/modules/MainOrganization/Invoice/core/constant/invoice.status.enum';
import { InsideStatusType } from '@/modules/MainOrganization/TaskAssignment/core/constants/inside.status.enum';
import { DepartmentTypeEnum } from '@/modules/shared/Department/core/constants/Type.enum';
import { ItemServiceTypeEnum } from '@/modules/shared/Item/core/constant/item.service.type.enum';
import arabicMessages from '@/locales/ar.json';
import englishMessages from '@/locales/en.json';
import { getSidebarSectionsWithCounts, sidebarSections } from '../sidebar.config';

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
    expect(
      sidebarSections
        .flatMap((section) => section.items)
        .filter((item) => item.type !== 'group')
        .every((item) => item.icon),
    ).toBe(true);
  });

  it('keeps every sidebar label localized in Arabic and English', () => {
    const labelKeys = sidebarSections.flatMap((section) => [
      section.labelKey,
      ...section.items.map((item) => item.labelKey),
    ]);

    expect(labelKeys.every((labelKey) => Object.hasOwn(englishMessages, labelKey))).toBe(true);
    expect(labelKeys.every((labelKey) => Object.hasOwn(arabicMessages, labelKey))).toBe(true);
  });

  it('shows Arabic copy for the organization administration section', () => {
    expect(arabicMessages['sidebar.organization']).toBe('المنظمة');
    expect(arabicMessages['sidebar.admins']).toBe('المشرفون');
  });

  it('uses the requested sidebar section order', () => {
    expect(sidebarSections.map((section) => section.labelKey)).toEqual([
      'sidebar.crm',
      'sidebar.design_offers',
      'sidebar.design_projects',
      'sidebar.execution-quotes',
      'sidebar.accounting',
      'sidebar.reports',
      'sidebar.sys_config',
      'sidebar.sys_identity',
      'sidebar.organization',
    ]);
  });

  it('groups execution offers after all design offer links in the same section', () => {
    const offersSection = sidebarSections.find((section) => section.key === 'design-offers');

    expect(offersSection?.items.slice(0, 3).map((item) => item.labelKey)).toEqual([
      'sidebar.supervision_offers',
      'sidebar.hold',
      'sidebar.canceled',
    ]);
    expect(offersSection?.items[3]).toEqual(
      expect.objectContaining({
        type: 'group',
        labelKey: 'sidebar.execution_offers',
        roles: ['organization'],
        flushTop: true,
      }),
    );
    expect(offersSection?.items.slice(4)).toEqual([
      expect.objectContaining({
        labelKey: 'sidebar.supervision_offers',
        path: `/offers-projects?service_type=${DepartmentTypeEnum.SUPERVISION},${DepartmentTypeEnum.BOTH}`,
      }),
      expect.objectContaining({ labelKey: 'sidebar.hold', disabled: true }),
      expect.objectContaining({ labelKey: 'sidebar.canceled', disabled: true }),
    ]);
    expect(sidebarSections.some((section) => section.key === 'execution-offers')).toBe(false);
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
        'sidebar.requests',
        'sidebar.offers',
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
    const items = sidebarSections.flatMap((section) => section.items);
    const packageItem = items.find((item) => item.path === '/package');
    const packageSubscriptionsItem = items.find((item) => item.path === '/package/subscriptions');

    expect(packageItem).toEqual(
      expect.objectContaining({
        labelKey: 'sidebar.packages',
        roles: ['admin'],
      }),
    );
    expect(packageSubscriptionsItem).toEqual(
      expect.objectContaining({
        labelKey: 'package.subscriptions',
        roles: ['admin'],
      }),
    );
  });

  it('includes the organization package subscription destination', () => {
    const packageItem = sidebarSections
      .flatMap((section) => section.items)
      .find((item) => item.path === '/packages');

    expect(packageItem).toEqual(
      expect.objectContaining({
        labelKey: 'sidebar.packages',
        roles: ['organization'],
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
    expect(
      items.find((item) => item.path === `/task-assignment?status=${InsideStatusType.ASSIGN}`),
    ).toEqual(
      expect.objectContaining({
        labelKey: 'sidebar.task',
        roles: ['organization'],
      }),
    );
    expect(
      items.find((item) => item.path === `/task-assignment?status=${InsideStatusType.HOLD}`),
    ).toEqual(
      expect.objectContaining({
        labelKey: 'sidebar.holding',
        roles: ['organization'],
      }),
    );
    expect(
      items.find((item) => item.path === `/task-assignment?status=${InsideStatusType.REVIEW}`),
    ).toEqual(
      expect.objectContaining({
        labelKey: 'sidebar.review',
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

  it('maps product and labor backend counts to their existing sidebar badges', () => {
    const items = getSidebarSectionsWithCounts({
      products_count: 17,
      labors_count: '9',
    }).flatMap((section) => section.items);
    const productItem = items.find((item) => item.path === '/products');
    const laborItem = items.find((item) => item.path === '/labor');

    expect(productItem).toEqual(
      expect.objectContaining({
        labelKey: 'sidebar.products',
        countKey: 'products_count',
        badge: '17',
      }),
    );

    expect(laborItem).toEqual(
      expect.objectContaining({
        labelKey: 'sidebar.labor',
        countKey: 'labors_count',
        badge: '9',
      }),
    );
  });

  it('maps admin-only entity counts to their existing menu items', () => {
    const items = getSidebarSectionsWithCounts({
      packages_count: 4,
      subscriptions_count: 3,
      organizations_count: 2,
      admins_count: 1,
    }).flatMap((section) => section.items);

    expect(
      ['/package', '/package/subscriptions', '/organization', '/admins'].map((path) => {
        const item = items.find((candidate) => candidate.path === path);
        return { countKey: item?.countKey, badge: item?.badge };
      }),
    ).toEqual([
      { countKey: 'packages_count', badge: '4' },
      { countKey: 'subscriptions_count', badge: '3' },
      { countKey: 'organizations_count', badge: '2' },
      { countKey: 'admins_count', badge: '1' },
    ]);
  });

  it('shows Contractor only in the Organization menu', () => {
    const contractor = sidebarSections
      .flatMap((section) => section.items)
      .find((sidebarItem) => sidebarItem.path === '/contractors');

    expect(contractor).toEqual(
      expect.objectContaining({
        labelKey: 'sidebar.contractors',
        roles: ['organization'],
        countKey: 'contractors_count',
      }),
    );
  });

  it('uses the organization Contractor count for its badge, including zero and missing values', () => {
    const contractorBadge = (counts: Parameters<typeof getSidebarSectionsWithCounts>[0]) =>
      getSidebarSectionsWithCounts(counts)
        .flatMap((section) => section.items)
        .find((item) => item.path === '/contractors')?.badge;

    expect(contractorBadge({ contractors_count: 7 })).toBe('7');
    expect(contractorBadge({ contractors_count: 0 })).toBe('0');
    expect(contractorBadge({})).toBeUndefined();
    expect(
      contractorBadge({ contractors_count: null } as unknown as Parameters<
        typeof getSidebarSectionsWithCounts
      >[0]),
    ).toBeUndefined();
  });

  it('leaves an Admin menu item visible without a badge when its API key is missing', () => {
    const items = getSidebarSectionsWithCounts({ organizations_count: 0 }).flatMap(
      (section) => section.items,
    );
    const organization = items.find((item) => item.path === '/organization');
    const admins = items.find((item) => item.path === '/admins');

    expect(organization?.badge).toBe('0');
    expect(admins).toEqual(
      expect.objectContaining({
        labelKey: 'sidebar.admins',
        countKey: 'admins_count',
        badge: undefined,
      }),
    );
  });

  it('keeps execution quotes in a dedicated organization section', () => {
    const executionQuotesSection = sidebarSections.find(
      (section) => section.key === 'execution-quotes',
    );
    const executionQuoteItemsOutsideSection = sidebarSections
      .filter((section) => section.key !== 'execution-quotes')
      .flatMap((section) => section.items)
      .filter((item) => item.path?.startsWith('/execution-quotes'));

    expect(executionQuotesSection).toEqual(
      expect.objectContaining({
        labelKey: 'sidebar.execution-quotes',
        items: [
          expect.objectContaining({
            path: '/execution-quotes',
            labelKey: 'sidebar.execution-quote',
            roles: ['organization'],
          }),
          expect.objectContaining({
            path: '/execution-quotes/add',
            labelKey: 'sidebar.add-execution-quote',
            roles: ['organization'],
          }),
        ],
      }),
    );
    expect(executionQuoteItemsOutsideSection).toEqual([]);
  });

  it('localizes the execution quotes section and actions in Arabic and English', () => {
    expect(englishMessages['sidebar.execution-quotes']).toBe('Execution Quotes');
    expect(arabicMessages['sidebar.execution-quotes']).toBe('مقايسات التنفيذ');
    expect(englishMessages['sidebar.execution-quote']).toBe('Execution Quote');
    expect(arabicMessages['sidebar.execution-quote']).toBe('مقايسة تنفيذ');
    expect(englishMessages['sidebar.add-execution-quote']).toBe('Add Execution Quote');
    expect(arabicMessages['sidebar.add-execution-quote']).toBe('إضافة مقايسة تنفيذ');
  });
});
