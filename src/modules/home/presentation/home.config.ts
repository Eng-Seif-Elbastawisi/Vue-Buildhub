import type { Component } from 'vue';
import {
  getSidebarSectionsWithCounts,
  type SidebarCountKey,
  type SidebarCountsPayload,
  type SidebarRole,
} from '@/shared/LayoutComponents/SubComponents/sidebar.config';

const ADMIN_HOME_MISSING_COUNT_FALLBACK = 0;

const homeCountKeys: Record<SidebarRole, readonly SidebarCountKey[]> = {
  organization: [
    'projects.pending_count',
    'clients_count',
    'employees_count',
    'invoices.total_count',
  ],
  admin: ['organizations_count', 'admins_count', 'packages_count', 'project_types_count'],
};

export interface HomeCard {
  key: SidebarCountKey;
  labelKey: string;
  icon: Component;
  to: string;
  count: number | null;
}

const readBadgeCount = (badge?: string): number | null => {
  if (badge === undefined) return null;
  const parsedCount = Number(badge);
  return Number.isFinite(parsedCount) && parsedCount >= 0 ? parsedCount : null;
};

export const getHomeCards = (
  role: SidebarRole,
  counts: SidebarCountsPayload | null,
): HomeCard[] => {
  const sidebarItems = getSidebarSectionsWithCounts(counts ?? {}).flatMap(
    (section) => section.items,
  );

  return homeCountKeys[role].flatMap((key) => {
    const sidebarItem = sidebarItems.find(
      (item) => item.countKey === key && (!item.roles || item.roles.includes(role)),
    );
    if (!sidebarItem?.path || !sidebarItem.icon || sidebarItem.disabled) return [];

    const realCount = readBadgeCount(sidebarItem.badge);

    return [
      {
        key,
        labelKey: sidebarItem.labelKey,
        icon: sidebarItem.icon,
        to: `/${role}${sidebarItem.path}`,
        count: realCount ?? (role === 'admin' ? ADMIN_HOME_MISSING_COUNT_FALLBACK : null),
      },
    ];
  });
};
