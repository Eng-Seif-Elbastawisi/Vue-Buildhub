import type { Component } from 'vue';

import EducationClassificationIcon from '@/shared/icons/SidebarIcons/EducationClassificationIcon.vue';
import ArticleIcon from '@/shared/icons/ArticleIcon.vue';

export type SidebarRole = 'admin' | 'organization';

export interface SidebarItemConfig {
  path: string;
  labelKey: string;
  icon?: Component;
  badge?: string;
  hasArrow?: boolean;
  roles?: SidebarRole[];
}

export interface SidebarSectionConfig {
  key: string;
  labelKey: string;
  icon: Component;
  items: SidebarItemConfig[];
}

export const sidebarSections: SidebarSectionConfig[] = [
  {
    key: 'overview',
    labelKey: 'Overview',
    icon: EducationClassificationIcon,
    items: [
      {
        path: '/stages',
        labelKey: 'Stages',
        icon: EducationClassificationIcon,
      },
      {
        path: '/departments',
        labelKey: 'Departments',
        icon: EducationClassificationIcon,
      },
      {
        path: '/measurement',
        labelKey: 'Measurement',
        icon: EducationClassificationIcon,
      },
      {
        path: '/item',
        labelKey: 'Items',
        icon: EducationClassificationIcon,
      },
      {
        path: '/project-item',
        labelKey: 'Project Item',
        icon: EducationClassificationIcon,
        roles: ['organization'],
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
        roles: ['organization'],
      },
      {
        path: '/client-source',
        labelKey: 'Client Source',
        icon: EducationClassificationIcon,
      },
      {
        path: '/specialization',
        labelKey: 'Specialization',
        icon: EducationClassificationIcon,
        roles: ['organization'],
      },
      {
        path: '/project',
        labelKey: 'Project',
        icon: EducationClassificationIcon,
        roles: ['organization'],
      },
      {
        path: '/system-identity',
        labelKey: 'system_identity.title',
        icon: EducationClassificationIcon,
        roles: ['organization', 'admin'],
      },
    ],
  },
  {
    key: 'suppliers',
    labelKey: 'Suppliers',
    icon: ArticleIcon,
    items: [
      {
        path: '/suppliers',
        labelKey: 'Suppliers',
        icon: ArticleIcon,
        roles: ['organization'],
      },
      {
        path: '/brand',
        labelKey: 'Brand',
        icon: ArticleIcon,
      },
      {
        path: '/supply',
        labelKey: 'Supply',
        icon: ArticleIcon,
      },
      {
        path: '/projectType',
        labelKey: 'Project Types',
        icon: ArticleIcon,
      },
      {
        path: '/client',
        labelKey: 'Clients',
        icon: ArticleIcon,
        roles: ['organization'],
      },
      {
        path: '/location',
        labelKey: 'Location',
        icon: ArticleIcon,
      },
      {
        path: '/location-governorate',
        labelKey: 'Location Governorate',
        icon: ArticleIcon,
      },
      {
        path: '/location-city',
        labelKey: 'Location City',
        icon: ArticleIcon,
      },
      {
        path: '/employee',
        labelKey: 'Employee',
        icon: ArticleIcon,
        roles: ['organization'],
      },
      {
        path: '/material',
        labelKey: 'Material',
        icon: ArticleIcon,
      },
      {
        path: '/space',
        labelKey: 'Space',
        icon: ArticleIcon,
      },
    ],
  },
];
