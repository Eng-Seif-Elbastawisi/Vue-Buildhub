import type { RouteRecordRaw } from '@/router/types';

export const ProjectPricingRoutes: RouteRecordRaw[] = [
  {
    path: 'project-pricing',
    name: 'Project Pricing',
    component: () => import('@/views/MainOrganization/ProjectPricing/IndexProjectPricing.vue'),
    meta: {
      breadcrumb: 'Project Pricing',
    },
  },
  {
    path: 'project-pricing/add',
    name: 'Add Project Pricing',
    component: () => import('@/views/MainOrganization/ProjectPricing/AddProjectPricing.vue'),
    meta: {
      breadcrumb: 'Add Project Pricing',
      parent: 'Project Pricing',
    },
  },
  {
    path: 'project-pricing/edit/:id',
    name: 'Edit Project Pricing',
    component: () => import('@/views/MainOrganization/ProjectPricing/EditProjectPricing.vue'),
    props: true,
    meta: {
      breadcrumb: 'Edit Project Pricing',
      parent: 'Project Pricing',
    },
  },
];
