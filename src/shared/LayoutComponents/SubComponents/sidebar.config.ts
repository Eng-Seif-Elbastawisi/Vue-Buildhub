import type { Component } from 'vue';

import SidebarUsersIcon from '@/shared/icons/SidebarIcons/SidebarUsersIcon.vue';
import SidebarShieldIcon from '@/shared/icons/SidebarIcons/SidebarShieldIcon.vue';
import {
  SidebarAdminIcon,
  SidebarAddRequestIcon,
  SidebarBrandTagIcon,
  SidebarCityIcon,
  SidebarClientIcon,
  SidebarClientSourceIcon,
  SidebarCountryIcon,
  SidebarDepartmentIcon,
  SidebarEmployeeIcon,
  SidebarFinanceIcon,
  SidebarGovernorateIcon,
  SidebarInvoiceIcon,
  SidebarItemIcon,
  SidebarMaterialIcon,
  SidebarMeasurementIcon,
  SidebarOrganizationIcon,
  SidebarProjectIcon,
  SidebarProjectTypeIcon,
  SidebarRequestIcon,
  SidebarSettingsPrimeIcon,
  SidebarSpaceIcon,
  SidebarSpecializationIcon,
  SidebarStageIcon,
  SidebarSupplierIcon,
  SidebarSupplyIcon,
  SidebarSystemIcon,
  SidebarTermIcon,
  SidebarToggleIcon,
} from '@/shared/icons/SidebarIcons/sidebarPrimeIcons';

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
  organization?: {
    id: number;
    name: string;
  };
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
        labelKey: 'Request',
        icon: SidebarRequestIcon,
        roles: ['organization'],
      },

      {
        path: '/project/add',
        labelKey: 'Add request',
        icon: SidebarAddRequestIcon,
        roles: ['organization'],
      },
      {
        path: '/client',
        labelKey: 'Clients',
        icon: SidebarClientIcon,
        badge: '2',
        countKey: 'clients_count',
        roles: ['organization'],
      },
    ],
  },
  {
    key: 'projects',
    labelKey: 'Projects',
    icon: SidebarProjectIcon,
    items: [
      {
        path: '/converted-projects',
        labelKey: 'Project.list_title',
        icon: SidebarProjectIcon,
        roles: ['organization'],
      },
    ],
  },
  {
    key: 'finance',
    labelKey: 'Finance',
    icon: SidebarFinanceIcon,
    items: [
      {
        path: '/invoice',
        labelKey: 'Invoice',
        icon: SidebarInvoiceIcon,
        badge: '1',
        countKey: 'invoices_count',
        roles: ['organization'],
      },
    ],
  },
  {
    key: 'setup',
    labelKey: 'Settings',
    icon: SidebarSettingsPrimeIcon,
    items: [
      {
        path: '/stages',
        labelKey: 'Stages',
        icon: SidebarStageIcon,
        badge: '1',
        countKey: 'stages_count',
      },
      {
        path: '/departments',
        labelKey: 'Departments',
        icon: SidebarDepartmentIcon,
        badge: '1',
        countKey: 'departments_count',
      },
      {
        path: '/measurement',
        labelKey: 'Measurement',
        icon: SidebarMeasurementIcon,
        badge: '1',
        countKey: 'measurement_units_count',
      },
      {
        path: '/item',
        labelKey: 'Items',
        icon: SidebarItemIcon,
        badge: '1',
        countKey: 'items_count',
      },
      {
        path: '/admin',
        labelKey: 'Admins',
        icon: SidebarAdminIcon,
        roles: ['admin'],
        badge: '1',
      },
      {
        path: '/organization',
        labelKey: 'Organizations',
        icon: SidebarOrganizationIcon,
        roles: ['admin'],
        badge: '1',
      },

      {
        path: '/client-source',
        labelKey: 'Client Source',
        icon: SidebarClientSourceIcon,
        badge: '1',
        countKey: 'client_sources_count',
      },
      {
        path: '/specialization',
        labelKey: 'Specialization',
        icon: SidebarSpecializationIcon,
        roles: ['organization'],
        badge: '1',
        countKey: 'specializations_count',
      },

      {
        path: '/suppliers',
        labelKey: 'Suppliers',
        icon: SidebarSupplierIcon,
        roles: ['organization'],
        badge: '1',
        countKey: 'suppliers_count',
      },
      {
        path: '/brand',
        labelKey: 'Brand',
        icon: SidebarBrandTagIcon,
        badge: '1',
        countKey: 'brands_count',
      },
      {
        path: '/supply',
        labelKey: 'Supply',
        icon: SidebarSupplyIcon,
        badge: '1',
        countKey: 'supplies_count',
      },
      {
        path: '/projectType',
        labelKey: 'Project Types',
        icon: SidebarProjectTypeIcon,
        badge: '1',
        countKey: 'project_types_count',
      },
      {
        path: '/location',
        labelKey: 'country',
        icon: SidebarCountryIcon,
        badge: '1',
        countKey: 'countries_count',
      },
      {
        path: '/location-governorate',
        labelKey: 'Governorate',
        icon: SidebarGovernorateIcon,
        badge: '1',
        countKey: 'governorates_count',
      },
      {
        path: '/location-city',
        labelKey: 'city',
        icon: SidebarCityIcon,
        badge: '1',
        countKey: 'cities_count',
      },
      {
        path: '/employee',
        labelKey: 'Employee',
        icon: SidebarEmployeeIcon,
        roles: ['organization'],
        badge: '1',
        countKey: 'employees_count',
      },
      {
        path: '/material',
        labelKey: 'Material',
        icon: SidebarMaterialIcon,
        badge: '1',
        countKey: 'materials_count',
      },
      {
        path: '/space',
        labelKey: 'Space',
        icon: SidebarSpaceIcon,
        badge: '1',
        countKey: 'spaces_count',
      },

      // {
      //   path: '/invoice-payment',
      //   labelKey: 'Invoice Payment',
      //   icon: ArticleIcon,
      //   badge: '1',
      //   countKey: 'invoice_payments_count',
      // },
      {
        path: '/term',
        labelKey: 'term',
        icon: SidebarTermIcon,
        roles: ['organization'],
      },
    ],
  },
  {
    key: 'system',
    labelKey: 'System',
    icon: SidebarShieldIcon,
    items: [
      {
        path: '/system-identity',
        labelKey: 'system_identity.title',
        icon: SidebarSystemIcon,
        roles: ['organization', 'admin'],
        badge: '1',
      },
      {
        path: '/organization-toggle',
        labelKey: 'organization_toggle.sidebar_label',
        icon: SidebarToggleIcon,
        roles: ['organization'],
        badge: '1',
      },
    ],
  },
];
