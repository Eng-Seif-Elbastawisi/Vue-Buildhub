import type { Component } from 'vue';

import EducationClassificationIcon from '@/shared/icons/SidebarIcons/EducationClassificationIcon.vue';
import ArticleIcon from '@/shared/icons/ArticleIcon.vue';
import SidebarUsersIcon from '@/shared/icons/SidebarIcons/SidebarUsersIcon.vue';
import SidebarSlidersIcon from '@/shared/icons/SidebarIcons/SidebarSlidersIcon.vue';
import SidebarShieldIcon from '@/shared/icons/SidebarIcons/SidebarShieldIcon.vue';

export type SidebarRole = 'admin' | 'organization';

export interface SidebarCountsPayload {
  projects_count?: number | string;
  project_previews_count?: number | string;
  countries_count?: number | string;
  governorates_count?: number | string;
  cities_count?: number | string;
  regions_count?: number | string;
  places_count?: number | string;
  departments_count?: number | string;
  stages_count?: number | string;
  project_types_count?: number | string;
  supplies_count?: number | string;
  materials_count?: number | string;
  brands_count?: number | string;
  spaces_count?: number | string;
  measurement_units_count?: number | string;
  client_sources_count?: number | string;
  items_count?: number | string;
  clients_count?: number | string;
  employees_count?: number | string;
  specializations_count?: number | string;
  suppliers_count?: number | string;
  invoices_count?: number | string;
  invoice_payments_count?: number | string;
}

export interface SidebarCountsApiResponse {
  status: boolean;
  message: string;
  data: SidebarCountsPayload;
}

export type SidebarCountKey = keyof SidebarCountsPayload;

export interface SidebarItemConfig {
  path: string;
  labelKey: string;
  icon?: Component;
  badge?: string;
  hasArrow?: boolean;
  roles?: SidebarRole[];
  countKey?: SidebarCountKey;
}

export interface SidebarSectionConfig {
  key: string;
  labelKey: string;
  icon: Component;
  items: SidebarItemConfig[];
}

const getSidebarCountText = (
  count: SidebarCountsPayload[SidebarCountKey] | undefined,
): string | undefined => {
  if (typeof count === 'number') {
    return Number.isFinite(count) ? `${count}` : undefined;
  }

  if (typeof count === 'string') {
    return count.trim() !== '' ? count : undefined;
  }

  return undefined;
};

const cloneSidebarSections = (sections: SidebarSectionConfig[]) => {
  return sections.map((section) => ({
    ...section,
    items: section.items.map((item) => ({
      ...item,
    })),
  }));
};

export const getSidebarSections = () => {
  return cloneSidebarSections(sidebarSections);
};

export const getSidebarSectionsWithCounts = (counts: Partial<SidebarCountsPayload> = {}) => {
  return getSidebarSections().map((section) => ({
    ...section,
    items: section.items.map((item) => {
      if (!item.countKey) return item;

      const count = getSidebarCountText(counts[item.countKey]);

      return {
        ...item,
        badge: count ?? item.badge,
      };
    }),
  }));
};

export const sidebarSections: SidebarSectionConfig[] = [
  {
    key: 'crm',
    labelKey: 'CRM',
    icon: SidebarUsersIcon,
    items: [
      {
        path: '/project',
        labelKey: 'projects',
        icon: EducationClassificationIcon,
        badge: '0',
        countKey: 'projects_count',
        roles: ['organization'],
      },
      {
        path: '/client',
        labelKey: 'clients',
        icon: EducationClassificationIcon,
        badge: '2',
        countKey: 'clients_count',
        roles: ['organization'],
      },
    ],
  },
  {
    key: 'setup',
    labelKey: 'الإعدادات',
    icon: SidebarSlidersIcon,
    items: [
      {
        path: '/stages',
        labelKey: 'Stages',
        icon: EducationClassificationIcon,
        badge: '1',
        countKey: 'stages_count',
      },
      {
        path: '/departments',
        labelKey: 'Departments',
        icon: EducationClassificationIcon,
        badge: '1',
        countKey: 'departments_count',
      },
      {
        path: '/measurement',
        labelKey: 'Measurement',
        icon: EducationClassificationIcon,
        badge: '1',
        countKey: 'measurement_units_count',
      },
      {
        path: '/item',
        labelKey: 'Items',
        icon: EducationClassificationIcon,
        badge: '1',
        countKey: 'items_count',
      },
      {
        path: '/admin',
        labelKey: 'Admins',
        icon: EducationClassificationIcon,
        roles: ['admin'],
        badge: '1',
      },
      {
        path: '/organization',
        labelKey: 'Organizations',
        icon: EducationClassificationIcon,
        roles: ['admin'],
        badge: '1',
      },

      {
        path: '/client-source',
        labelKey: 'Client Source',
        icon: EducationClassificationIcon,
        badge: '1',
        countKey: 'client_sources_count',
      },
      {
        path: '/specialization',
        labelKey: 'Specialization',
        icon: EducationClassificationIcon,
        roles: ['organization'],
        badge: '1',
        countKey: 'specializations_count',
      },

      {
        path: '/suppliers',
        labelKey: 'Suppliers',
        icon: ArticleIcon,
        roles: ['organization'],
        badge: '1',
        countKey: 'suppliers_count',
      },
      {
        path: '/brand',
        labelKey: 'Brand',
        icon: ArticleIcon,
        badge: '1',
        countKey: 'brands_count',
      },
      {
        path: '/supply',
        labelKey: 'Supply',
        icon: ArticleIcon,
        badge: '1',
        countKey: 'supplies_count',
      },
      {
        path: '/projectType',
        labelKey: 'Project Types',
        icon: ArticleIcon,
        badge: '1',
        countKey: 'project_types_count',
      },
      {
        path: '/location',
        labelKey: 'country',
        icon: ArticleIcon,
        badge: '1',
        countKey: 'countries_count',
      },
      {
        path: '/location-governorate',
        labelKey: 'Governorate',
        icon: ArticleIcon,
        badge: '1',
        countKey: 'governorates_count',
      },
      {
        path: '/location-city',
        labelKey: 'city',
        icon: ArticleIcon,
        badge: '1',
        countKey: 'cities_count',
      },
      {
        path: '/employee',
        labelKey: 'Employee',
        icon: ArticleIcon,
        roles: ['organization'],
        badge: '1',
        countKey: 'employees_count',
      },
      {
        path: '/material',
        labelKey: 'Material',
        icon: ArticleIcon,
        badge: '1',
        countKey: 'materials_count',
      },
      {
        path: '/space',
        labelKey: 'Space',
        icon: ArticleIcon,
        badge: '1',
        countKey: 'spaces_count',
      },
    ],
  },
  {
    key: 'suppliers',
    labelKey: 'Suppliers',
    icon: SidebarShieldIcon,
    items: [
      {
        path: '/system-identity',
        labelKey: 'system_identity.title',
        icon: EducationClassificationIcon,
        roles: ['organization', 'admin'],
        badge: '1',
      },
      {
        path: '/organization-toggle',
        labelKey: 'Organization',
        icon: EducationClassificationIcon,
        roles: ['organization'],
        badge: '1',
      },
    ],
  },
];
