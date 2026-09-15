import type { Component } from 'vue';
import { InvoiceStatusEnum } from '@/modules/MainOrganization/Invoice/core/constant/invoice.status.enum';

import {
  SidebarAddRequestIcon,
  SidebarBrandTagIcon,
  SidebarCanceledIcon,
  SidebarCityIcon,
  SidebarClientIcon,
  SidebarClientSourceIcon,
  SidebarCollectionIcon,
  SidebarConstructionConfigIcon,
  SidebarCountryIcon,
  SidebarDesignConfigIcon,
  SidebarDesignOffersIcon,
  SidebarDesignProjectsIcon,
  SidebarDepartmentIcon,
  SidebarFinanceIcon,
  SidebarFullPackageIcon,
  SidebarGeneralSettingIcon,
  SidebarGovernorateIcon,
  SidebarHoldIcon,
  SidebarInProgressIcon,
  SidebarInvoiceIcon,
  SidebarItemIcon,
  SidebarLocationsSetupIcon,
  SidebarMaterialIcon,
  SidebarMeasurementIcon,
  SidebarOfferIcon,
  SidebarPaidInvoiceIcon,
  SidebarPlanIcon,
  SidebarProductivityIcon,
  SidebarProjectIcon,
  SidebarProjectTypeIcon,
  SidebarReportIcon,
  SidebarRequestIcon,
  SidebarSettingsPrimeIcon,
  SidebarSpaceIcon,
  SidebarSpecializationIcon,
  SidebarStageIcon,
  SidebarSupplierIcon,
  SidebarSupplyIcon,
  SidebarSysColorsIcon,
  SidebarSysDataIcon,
  SidebarSystemIcon,
  SidebarTermIcon,
  SidebarUnpaidInvoiceIcon,
  SidebarUpcomingPaymentIcon,
  SidebarEmployeeIcon,
} from '@/shared/icons/SidebarIcons/sidebarPrimeIcons';
import { DepartmentTypeEnum } from '@/modules/shared/Department/core/constants/Type.enum';
import { ItemServiceTypeEnum } from '@/modules/shared/Item/core/constant/item.service.type.enum';
import { InsideStatusType } from '@/modules/MainOrganization/TaskAssignment/core/constants/inside.status.enum';

export type SidebarRole = 'admin' | 'organization';

export type SidebarCountValue = number | string;

export interface SidebarLocationCounts {
  countries_count?: SidebarCountValue;
  governorates_count?: SidebarCountValue;
  cities_count?: SidebarCountValue;
  regions_count?: SidebarCountValue;
  places_count?: SidebarCountValue;
}
export interface SidebarInvoiceCounts {
  total_count?: SidebarCountValue;
  paid_count?: SidebarCountValue;
  unpaid_count?: SidebarCountValue;
  not_exported_count?: SidebarCountValue;
}
export interface SidebarItemCounts {
  design_count?: SidebarCountValue;
  supervision_count?: SidebarCountValue;
  both_count?: SidebarCountValue;
}

export interface SidebarDepartmentCounts {
  design_count?: SidebarCountValue;
  supervision_count?: SidebarCountValue;
  both_count?: SidebarCountValue;
}
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
  locations?: SidebarLocationCounts;
  invoices?: SidebarInvoiceCounts;

  items?: SidebarItemCounts;
  departments?: SidebarDepartmentCounts;
}

export interface SidebarCountsApiResponse {
  status: boolean;
  message: string;
  data: SidebarCountsPayload;
}

export type SidebarRootCountKey =
  | 'projects_count'
  | 'project_previews_count'
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

export type SidebarLocationCountKey =
  | 'locations.countries_count'
  | 'locations.governorates_count'
  | 'locations.cities_count'
  | 'locations.regions_count'
  | 'locations.places_count';
export type SidebarInvoiceCountKey =
  | 'invoices.total_count'
  | 'invoices.paid_count'
  | 'invoices.unpaid_count'
  | 'invoices.not_exported_count';

export type SidebarProjectCountKey =
  | 'projects.total_count'
  | 'projects.pending_count'
  | 'projects.convert_to_project_count'
  | 'projects.send_to_client_count'
  | 'projects.revise_version_count';

export type SidebarItemCountKey =
  'items.design_count' | 'items.supervision_count' | 'items.both_count';

export type SidebarDepartmentCountKey =
  'departments.design_count' | 'departments.supervision_count' | 'departments.both_count';

export type SidebarCountKey =
  | SidebarRootCountKey
  | SidebarProjectCountKey
  | SidebarLocationCountKey
  | SidebarInvoiceCountKey
  | SidebarItemCountKey
  | SidebarDepartmentCountKey;

export interface SidebarItemConfig {
  type?: 'item' | 'group';
  path?: string;
  labelKey: string;
  icon?: Component;
  badge?: string;
  hasArrow?: boolean;
  roles?: SidebarRole[];
  countKey?: SidebarCountKey;
  disabled?: boolean;
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
    labelKey: 'sidebar.crm',
    icon: SidebarRequestIcon,

    items: [
      {
        path: '/project/add',
        labelKey: 'sidebar.add_request',
        icon: SidebarAddRequestIcon,
        roles: ['organization'],
      },
      {
        path: '/project',
        labelKey: 'sidebar.requests',
        icon: SidebarRequestIcon,
        roles: ['organization'],
        countKey: 'projects.pending_count',
      },

      {
        path: '/client',
        labelKey: 'sidebar.clients',
        icon: SidebarClientIcon,
        countKey: 'clients_count',
        roles: ['organization'],
      },
      {
        path: '/employee',
        labelKey: 'employee',
        icon: SidebarEmployeeIcon,
        roles: ['organization'],
        countKey: 'employees_count',
      },
    ],
  },

  {
    key: 'design-offers',
    labelKey: 'sidebar.design_offers',
    icon: SidebarDesignOffersIcon,

    items: [
      {
        path: `/offers-projects?service_type=${DepartmentTypeEnum.DESIGN},${DepartmentTypeEnum.BOTH}`,
        labelKey: 'sidebar.supervision_offers',
        icon: SidebarProjectIcon,
        roles: ['organization'],
      },
      {
        labelKey: 'sidebar.hold',
        icon: SidebarHoldIcon,
        roles: ['organization'],
        disabled: true,
      },

      {
        labelKey: 'sidebar.canceled',
        icon: SidebarCanceledIcon,
        roles: ['organization'],
        disabled: true,
      },
    ],
  },

  {
    key: 'design-projects',
    labelKey: 'sidebar.design_projects',
    icon: SidebarDesignProjectsIcon,

    items: [
      {
        path: `/converted-projects?service_type=${DepartmentTypeEnum.DESIGN},${DepartmentTypeEnum.BOTH}`,
        labelKey: 'sidebar.design_projects',
        icon: SidebarProjectIcon,
        roles: ['organization'],
      },
      {
        labelKey: 'sidebar.plan',
        path: '/task-assignment/approved',
        icon: SidebarPlanIcon,
        roles: ['organization'],
      },
      {
        path: `/task-assignment?status=${InsideStatusType.ASSIGN}`,
        labelKey: 'sidebar.task',
        icon: SidebarProductivityIcon,
        roles: ['organization'],
      },

      {
        path: `/task-assignment?status=${InsideStatusType.WORKING}`,
        labelKey: 'sidebar.in_progress',
        icon: SidebarInProgressIcon,
        roles: ['organization'],
        // disabled: true,
      },

      {
        path: `/task-assignment?status=${InsideStatusType.HOLD}`,
        labelKey: 'sidebar.holding',
        icon: SidebarFullPackageIcon,
        roles: ['organization'],
        // disabled: true,
      },
      {
        path: `/task-assignment?status=${InsideStatusType.REVIEW}`,
        labelKey: 'sidebar.review',
        icon: SidebarFullPackageIcon,
        roles: ['organization'],
        // disabled: true,
      },
    ],
  },

  {
    key: 'accounting',
    labelKey: 'sidebar.accounting',
    icon: SidebarFinanceIcon,

    items: [
      {
        path: '/invoice',
        labelKey: 'sidebar.all_invoices',
        icon: SidebarInvoiceIcon,
        countKey: 'invoices.total_count',
        roles: ['organization'],
      },
      {
        path: '/invoice/add',
        labelKey: 'sidebar.new_invoices',
        icon: SidebarInvoiceIcon,
        // countKey: 'invoices.not_exported_count',
        roles: ['organization'],
      },

      {
        path: `/invoice?status=${InvoiceStatusEnum.PAID}`,
        labelKey: 'sidebar.paid_invoices',
        icon: SidebarPaidInvoiceIcon,
        countKey: 'invoices.paid_count',
        roles: ['organization'],
      },

      {
        path: `/invoice?status=${InvoiceStatusEnum.UNPAID}`,
        labelKey: 'sidebar.unpaid_invoices',
        icon: SidebarUnpaidInvoiceIcon,
        countKey: 'invoices.unpaid_count',
        roles: ['organization'],
      },
    ],
  },

  {
    key: 'reports',
    labelKey: 'sidebar.reports',
    icon: SidebarReportIcon,

    items: [
      {
        labelKey: 'sidebar.requests',
        icon: SidebarRequestIcon,
        roles: ['organization'],
        disabled: true,
      },

      {
        labelKey: 'sidebar.offers',
        icon: SidebarOfferIcon,
        roles: ['organization'],
        disabled: true,
      },

      {
        labelKey: 'sidebar.collection',
        icon: SidebarCollectionIcon,
        roles: ['organization'],
        disabled: true,
      },

      {
        labelKey: 'sidebar.upcoming_payment',
        icon: SidebarUpcomingPaymentIcon,
        roles: ['organization'],
        disabled: true,
      },

      {
        labelKey: 'sidebar.productivity',
        icon: SidebarProductivityIcon,
        roles: ['organization'],
        disabled: true,
      },
    ],
  },

  {
    key: 'sys-config',
    labelKey: 'sidebar.sys_config',
    icon: SidebarSettingsPrimeIcon,

    items: [
      {
        type: 'group',
        labelKey: 'sidebar.general_setting',
        icon: SidebarGeneralSettingIcon,
      },

      {
        path: '/package',
        labelKey: 'sidebar.packages',
        icon: SidebarFullPackageIcon,
        roles: ['admin'],
      },

      {
        path: '/package/subscriptions',
        labelKey: 'package.subscriptions',
        icon: SidebarFullPackageIcon,
        roles: ['admin'],
      },

      {
        path: '/packages',
        labelKey: 'sidebar.packages',
        icon: SidebarFullPackageIcon,
        roles: ['organization'],
      },

      {
        path: '/client-source',
        labelKey: 'sidebar.client_source',
        icon: SidebarClientSourceIcon,
        countKey: 'client_sources_count',
      },

      {
        path: '/terms',
        labelKey: 'sidebar.terms',
        icon: SidebarTermIcon,
        countKey: 'term_count',
        roles: ['organization'],
      },

      {
        path: '/projectType',
        labelKey: 'sidebar.project_types',
        icon: SidebarProjectTypeIcon,
        countKey: 'project_types_count',
      },

      {
        path: '/space',
        labelKey: 'sidebar.spaces',
        icon: SidebarSpaceIcon,
        countKey: 'spaces_count',
      },

      {
        type: 'group',
        labelKey: 'sidebar.locations_setup',
        icon: SidebarLocationsSetupIcon,
      },

      {
        path: '/location',
        labelKey: 'sidebar.country',
        icon: SidebarCountryIcon,
        countKey: 'locations.countries_count',
      },

      {
        path: '/location-governorate',
        labelKey: 'sidebar.governorate',
        icon: SidebarGovernorateIcon,
        countKey: 'locations.governorates_count',
      },

      {
        path: '/location-city',
        labelKey: 'sidebar.city',
        icon: SidebarCityIcon,
        countKey: 'locations.cities_count',
      },

      {
        type: 'group',
        labelKey: 'sidebar.design_config',
        icon: SidebarDesignConfigIcon,
      },

      {
        path: `/departments?type=${DepartmentTypeEnum.DESIGN}`,
        labelKey: 'sidebar.departments',
        icon: SidebarDepartmentIcon,
        countKey: 'departments.design_count',
      },

      {
        path: `/item?service_type=${ItemServiceTypeEnum.DESIGN}`,
        labelKey: 'sidebar.items',
        icon: SidebarItemIcon,
        countKey: 'items.design_count',
      },

      {
        type: 'group',
        labelKey: 'sidebar.construction_config',
        icon: SidebarConstructionConfigIcon,
      },

      {
        path: '/stages',
        labelKey: 'sidebar.stages',
        icon: SidebarStageIcon,
        countKey: 'stages_count',
      },

      {
        path: `/departments?type=${DepartmentTypeEnum.SUPERVISION}`,
        labelKey: 'sidebar.departments',
        icon: SidebarDepartmentIcon,
        countKey: 'departments.supervision_count',
      },

      {
        path: `/item?service_type=${ItemServiceTypeEnum.SUPERVISION}`,
        labelKey: 'sidebar.items',
        icon: SidebarItemIcon,
        countKey: 'items.supervision_count',
      },
      {
        path: '/item_types',
        labelKey: 'sidebar.item_types',
        icon: SidebarMeasurementIcon,
      },

      {
        path: '/measurement',
        labelKey: 'sidebar.measurements',
        icon: SidebarMeasurementIcon,
        countKey: 'measurement_units_count',
      },

      {
        path: '/specialization',
        labelKey: 'sidebar.specialization',
        icon: SidebarSpecializationIcon,
        roles: ['organization'],
        countKey: 'specializations_count',
      },
      {
        path: '/products',
        labelKey: 'sidebar.products',
        icon: SidebarItemIcon,
      },
      {
        path: '/suppliers',
        labelKey: 'sidebar.suppliers',
        icon: SidebarSupplierIcon,
        roles: ['organization'],
        countKey: 'suppliers_count',
      },

      {
        path: '/material',
        labelKey: 'sidebar.materials',
        icon: SidebarMaterialIcon,
        countKey: 'materials_count',
      },

      {
        path: '/brand',
        labelKey: 'sidebar.brands',
        icon: SidebarBrandTagIcon,
        countKey: 'brands_count',
      },

      {
        path: '/supply',
        labelKey: 'sidebar.supply',
        icon: SidebarSupplyIcon,
        countKey: 'supplies_count',
      },
    ],
  },

  {
    key: 'sys-identity',
    labelKey: 'sidebar.sys_identity',
    icon: SidebarSystemIcon,

    items: [
      {
        path: '/system-identity?section=colors',
        labelKey: 'sidebar.sys_colors',
        icon: SidebarSysColorsIcon,
        roles: ['organization', 'admin'],
      },

      {
        path: '/organization-toggle',
        labelKey: 'sidebar.sys_data',
        icon: SidebarSysDataIcon,
        roles: ['organization'],
      },
    ],
  },

  {
    key: 'organization',
    labelKey: 'sidebar.organization',
    icon: SidebarSysDataIcon,
    items: [
      {
        path: '/organization',
        labelKey: 'sidebar.organization',
        icon: SidebarEmployeeIcon,
        roles: ['admin'],
      },
      {
        path: '/admins',
        labelKey: 'sidebar.admins',
        icon: SidebarEmployeeIcon,
        roles: ['admin'],
      },
    ],
  },
];
