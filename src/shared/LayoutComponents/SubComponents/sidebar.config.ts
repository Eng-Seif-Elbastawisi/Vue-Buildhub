import type { Component } from 'vue';

import EducationClassificationIcon from '@/shared/icons/SidebarIcons/EducationClassificationIcon.vue';
import ArticleIcon from '@/shared/icons/ArticleIcon.vue';
import SidebarUsersIcon from '@/shared/icons/SidebarIcons/SidebarUsersIcon.vue';
import SidebarSlidersIcon from '@/shared/icons/SidebarIcons/SidebarSlidersIcon.vue';
import SidebarShieldIcon from '@/shared/icons/SidebarIcons/SidebarShieldIcon.vue';

export type SidebarRole = 'admin' | 'organization';

export type SidebarCountValue = number | string;

export interface SidebarProjectCounts {
  total_count?: SidebarCountValue;
  pending_count?: SidebarCountValue;
  convert_to_project_count?: SidebarCountValue;
  send_to_client_count?: SidebarCountValue;
  revise_version_count?: SidebarCountValue;
}

export interface SidebarCountsPayload {
  projects_count?: SidebarCountValue;
  project_previews_count?: SidebarCountValue;
  countries_count?: SidebarCountValue;
  governorates_count?: SidebarCountValue;
  cities_count?: SidebarCountValue;
  regions_count?: SidebarCountValue;
  places_count?: SidebarCountValue;
  departments_count?: SidebarCountValue;
  stages_count?: SidebarCountValue;
  project_types_count?: SidebarCountValue;
  supplies_count?: SidebarCountValue;
  materials_count?: SidebarCountValue;
  brands_count?: SidebarCountValue;
  spaces_count?: SidebarCountValue;
  measurement_units_count?: SidebarCountValue;
  client_sources_count?: SidebarCountValue;
  items_count?: SidebarCountValue;
  clients_count?: SidebarCountValue;
  employees_count?: SidebarCountValue;
  specializations_count?: SidebarCountValue;
  suppliers_count?: SidebarCountValue;
  invoices_count?: SidebarCountValue;
  invoice_payments_count?: SidebarCountValue;
  term_count?: SidebarCountValue;

  organization?: {
    id: number;
    name: string;
  };

  projects?: SidebarProjectCounts;
}

export interface SidebarCountsApiResponse {
  status: boolean;
  message: string;
  data: SidebarCountsPayload;
}

export type SidebarRootCountKey =
  | 'projects_count'
  | 'project_previews_count'
  | 'countries_count'
  | 'governorates_count'
  | 'cities_count'
  | 'regions_count'
  | 'places_count'
  | 'departments_count'
  | 'stages_count'
  | 'project_types_count'
  | 'supplies_count'
  | 'materials_count'
  | 'brands_count'
  | 'spaces_count'
  | 'measurement_units_count'
  | 'client_sources_count'
  | 'items_count'
  | 'clients_count'
  | 'employees_count'
  | 'specializations_count'
  | 'suppliers_count'
  | 'invoices_count'
  | 'invoice_payments_count'
  | 'term_count';

export type SidebarProjectCountKey =
  | 'projects.total_count'
  | 'projects.pending_count'
  | 'projects.convert_to_project_count'
  | 'projects.send_to_client_count'
  | 'projects.revise_version_count';

export type SidebarCountKey = SidebarRootCountKey | SidebarProjectCountKey;

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

const getSidebarCountText = (count: unknown): string | undefined => {
  if (typeof count === 'number') {
    return Number.isFinite(count) ? String(count) : undefined;
  }

  if (typeof count === 'string') {
    const normalizedCount = count.trim();

    return normalizedCount !== '' ? normalizedCount : undefined;
  }

  return undefined;
};

const getNestedCount = (
  counts: Partial<SidebarCountsPayload>,
  countKey: SidebarCountKey,
): unknown => {
  return countKey.split('.').reduce<unknown>((currentValue, key) => {
    if (currentValue === null || typeof currentValue !== 'object') {
      return undefined;
    }

    return (currentValue as Record<string, unknown>)[key];
  }, counts);
};

const cloneSidebarSections = (sections: SidebarSectionConfig[]): SidebarSectionConfig[] => {
  return sections.map((section) => ({
    ...section,

    items: section.items.map((item) => ({
      ...item,
    })),
  }));
};

export const getSidebarSections = (): SidebarSectionConfig[] => {
  return cloneSidebarSections(sidebarSections);
};

export const getSidebarSectionsWithCounts = (
  counts: Partial<SidebarCountsPayload> = {},
): SidebarSectionConfig[] => {
  return getSidebarSections().map((section) => ({
    ...section,

    items: section.items.map((item) => {
      if (!item.countKey) {
        return item;
      }

      const rawCount = getNestedCount(counts, item.countKey);

      const count = getSidebarCountText(rawCount);

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
        path: '/project/add',
        labelKey: 'add_request',
        icon: EducationClassificationIcon,
        roles: ['organization'],
      },
      {
        path: '/project',
        labelKey: 'requests',
        icon: EducationClassificationIcon,
        roles: ['organization'],
        countKey: 'projects.pending_count',
      },

      {
        path: '/client',
        labelKey: 'clients',
        icon: EducationClassificationIcon,
        countKey: 'clients_count',
        roles: ['organization'],
      },
    ],
  },

  {
    key: 'design',
    labelKey: 'design',
    icon: SidebarShieldIcon,

    items: [
      {
        path: '/converted-projects',
        labelKey: 'design',
        icon: EducationClassificationIcon,
        roles: ['organization'],
        countKey: 'projects.total_count',
      },
    ],
  },

  {
    key: 'finance',
    labelKey: 'Finance',
    icon: SidebarShieldIcon,

    items: [
      {
        path: '/invoice',
        labelKey: 'Invoice',
        icon: ArticleIcon,
        countKey: 'invoices_count',
        roles: ['organization'],
      },
    ],
  },

  {
    key: 'setup',
    labelKey: 'Setting',
    icon: SidebarSlidersIcon,

    items: [
      {
        path: '/stages',
        labelKey: 'Stages',
        icon: EducationClassificationIcon,
        countKey: 'stages_count',
      },

      {
        path: '/departments',
        labelKey: 'Departments',
        icon: EducationClassificationIcon,
        countKey: 'departments_count',
      },

      {
        path: '/measurement',
        labelKey: 'Measurement',
        icon: EducationClassificationIcon,
        countKey: 'measurement_units_count',
      },

      {
        path: '/item',
        labelKey: 'Items',
        icon: EducationClassificationIcon,
        countKey: 'items_count',
      },

      {
        path: '/admin',
        labelKey: 'Admins',
        icon: EducationClassificationIcon,
        roles: ['admin'],
      },

      {
        path: '/organization',
        labelKey: 'Organizations',
        icon: EducationClassificationIcon,
        roles: ['admin'],
      },

      {
        path: '/client-source',
        labelKey: 'Client Source',
        icon: EducationClassificationIcon,
        countKey: 'client_sources_count',
      },

      {
        path: '/specialization',
        labelKey: 'Specialization',
        icon: EducationClassificationIcon,
        roles: ['organization'],
        countKey: 'specializations_count',
      },

      {
        path: '/suppliers',
        labelKey: 'Suppliers',
        icon: ArticleIcon,
        roles: ['organization'],
        countKey: 'suppliers_count',
      },

      {
        path: '/brand',
        labelKey: 'Brand',
        icon: ArticleIcon,
        countKey: 'brands_count',
      },

      {
        path: '/supply',
        labelKey: 'Supply',
        countKey: 'supplies_count',
      },

      {
        path: '/projectType',
        labelKey: 'Project Types',
        icon: ArticleIcon,
        countKey: 'project_types_count',
      },

      {
        path: '/location',
        labelKey: 'country',
        icon: ArticleIcon,
        countKey: 'countries_count',
      },

      {
        path: '/location-governorate',
        labelKey: 'Governorate',
        icon: ArticleIcon,
        countKey: 'governorates_count',
      },

      {
        path: '/location-city',
        labelKey: 'city',
        icon: ArticleIcon,
        countKey: 'cities_count',
      },

      {
        path: '/employee',
        labelKey: 'Employee',
        icon: ArticleIcon,
        roles: ['organization'],
        countKey: 'employees_count',
      },

      {
        path: '/material',
        labelKey: 'Material',
        icon: ArticleIcon,
        countKey: 'materials_count',
      },

      {
        path: '/space',
        labelKey: 'Space',
        icon: ArticleIcon,
        countKey: 'spaces_count',
      },

      // {
      //   path: '/invoice-payment',
      //   labelKey: 'Invoice Payment',
      //   icon: ArticleIcon,
      //   countKey: 'invoice_payments_count',
      // },

      {
        path: '/term',
        labelKey: 'term',
        icon: ArticleIcon,
        roles: ['organization'],
        countKey: 'term_count',
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
      },

      {
        path: '/organization-toggle',
        labelKey: 'Organization',
        icon: EducationClassificationIcon,
        roles: ['organization'],
      },
    ],
  },
];
