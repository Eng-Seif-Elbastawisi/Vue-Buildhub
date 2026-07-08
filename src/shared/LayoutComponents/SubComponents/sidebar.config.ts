import type { Component } from 'vue';

import EducationClassificationIcon from '@/shared/icons/SidebarIcons/EducationClassificationIcon.vue';
import ArticleIcon from '@/shared/icons/ArticleIcon.vue';
import SidebarUsersIcon from '@/shared/icons/SidebarIcons/SidebarUsersIcon.vue';
import SidebarSlidersIcon from '@/shared/icons/SidebarIcons/SidebarSlidersIcon.vue';
import SidebarShieldIcon from '@/shared/icons/SidebarIcons/SidebarShieldIcon.vue';

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
    key: 'crm',
    labelKey: 'CRM',
    icon: SidebarUsersIcon,
    items: [
      {
        path: '/project',
        labelKey: 'projects',
        icon: EducationClassificationIcon,
        badge: '0',
        roles: ['organization'],
      },
      {
        path: '/client',
        labelKey: 'clients',
        icon: EducationClassificationIcon,
        badge: '2',
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
      },
      {
        path: '/departments',
        labelKey: 'Departments',
        icon: EducationClassificationIcon,
        badge: '1',
      },
      {
        path: '/measurement',
        labelKey: 'Measurement',
        icon: EducationClassificationIcon,
        badge: '1',
      },
      {
        path: '/item',
        labelKey: 'Items',
        icon: EducationClassificationIcon,
        badge: '1',
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
      },
      {
        path: '/specialization',
        labelKey: 'Specialization',
        icon: EducationClassificationIcon,
        roles: ['organization'],
        badge: '1',
      },

      {
        path: '/suppliers',
        labelKey: 'Suppliers',
        icon: ArticleIcon,
        roles: ['organization'],
        badge: '1',
      },
      {
        path: '/brand',
        labelKey: 'Brand',
        icon: ArticleIcon,
        badge: '1',
      },
      {
        path: '/supply',
        labelKey: 'Supply',
        icon: ArticleIcon,
        badge: '1',
      },
      {
        path: '/projectType',
        labelKey: 'Project Types',
        icon: ArticleIcon,
        badge: '1',
      },
      {
        path: '/location',
        labelKey: 'country',
        icon: ArticleIcon,
        badge: '1',
      },
      {
        path: '/location-governorate',
        labelKey: 'Governorate',
        icon: ArticleIcon,
        badge: '1',
      },
      {
        path: '/location-city',
        labelKey: 'city',
        icon: ArticleIcon,
        badge: '1',
      },
      {
        path: '/employee',
        labelKey: 'Employee',
        icon: ArticleIcon,
        roles: ['organization'],
        badge: '1',
      },
      {
        path: '/material',
        labelKey: 'Material',
        icon: ArticleIcon,
        badge: '1',
      },
      {
        path: '/space',
        labelKey: 'Space',
        icon: ArticleIcon,
        badge: '1',
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
