import { describe, expect, it } from 'vitest';
import { getHomeCards } from '../home.config';
import { sidebarSections } from '@/shared/LayoutComponents/SubComponents/sidebar.config';

describe('getHomeCards', () => {
  it('uses Organization sidebar labels, icons, routes, visibility, and API counts', () => {
    const cards = getHomeCards('organization', {
      projects: { pending_count: 12 },
      clients_count: 24,
      employees_count: 3,
      invoices: { total_count: 7 },
    });
    const sidebarItems = sidebarSections.flatMap((section) => section.items);

    expect(cards.map(({ key, to, count }) => [key, to, count])).toEqual([
      ['projects.pending_count', '/organization/project', 12],
      ['clients_count', '/organization/client', 24],
      ['employees_count', '/organization/employee', 3],
      ['invoices.total_count', '/organization/invoice', 7],
    ]);
    cards.forEach((card) => {
      const sidebarItem = sidebarItems.find((item) => item.countKey === card.key);
      expect(card.labelKey).toBe(sidebarItem?.labelKey);
      expect(card.icon).toBe(sidebarItem?.icon);
    });
  });

  it('keeps four Admin cards visible at zero until their sidebar counts arrive', () => {
    const missingCards = getHomeCards('admin', null);
    const countedCards = getHomeCards('admin', {
      organizations_count: 28,
      admins_count: 0,
      packages_count: 4,
      subscriptions_count: '98',
    });
    const sidebarItems = sidebarSections.flatMap((section) => section.items);

    expect(missingCards.map(({ to, count }) => [to, count])).toEqual([
      ['/admin/organization', 0],
      ['/admin/admins', 0],
      ['/admin/package', 0],
      ['/admin/package/subscriptions', 0],
    ]);
    expect(countedCards.map((card) => card.count)).toEqual([28, 0, 4, 98]);
    expect(countedCards.every((card) => card.to.startsWith('/admin/'))).toBe(true);
    countedCards.forEach((card) => {
      const sidebarItem = sidebarItems.find((item) => item.countKey === card.key);
      expect(card.labelKey).toBe(sidebarItem?.labelKey);
      expect(card.icon).toBe(sidebarItem?.icon);
      expect(sidebarItem?.roles).toContain('admin');
    });
  });
});
