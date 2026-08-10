import type { RouteRecordRaw } from '@/router/types';

export const ProjectRoutes: RouteRecordRaw[] = [
  {
    path: 'project',
    name: 'project',
    component: () => import('@/views/MainOrganization/Project/IndexProject.vue'),
    meta: {
      breadcrumb: 'project.breadcrumb.requests',
      pageHeaderDescription: 'project.page.requests_description',
      pageHeaderActionLabel: 'project.page.add_request',
    },
  },
  {
    path: 'converted-projects',
    name: 'converted-projects',
    component: () => import('@/views/MainOrganization/Project/IndexConvertedProject.vue'),
    meta: {
      breadcrumb: 'project.breadcrumb.converted',
      pageHeaderDescription: 'project.page.converted_description',
      pageHeaderActionLabel: 'project.page.add_project',
    },
  },
  {
    path: 'offers-projects',
    name: 'offers-projects',
    component: () => import('@/views/MainOrganization/Project/IndexOfferProject.vue'),
    meta: {
      breadcrumb: 'project.breadcrumb.offers',
      pageHeaderDescription: 'project.page.offers_description',
      pageHeaderActionLabel: 'project.page.add_offer',
    },
  },

  {
    path: 'project/add',
    name: 'add-project',
    component: () => import('@/views/MainOrganization/Project/AddProject.vue'),
    meta: {
      breadcrumb: 'Add request',
      parent: 'project',
    },
  },
  {
    path: 'project/edit/:project_id',
    name: 'edit-project',
    component: () => import('@/views/MainOrganization/Project/EditProject.vue'),
    props: true,
    meta: {
      breadcrumb: 'Edit request',
      parent: 'project',
    },
  },
  {
    path: 'project/show/:project_id',
    name: 'show-project',
    component: () => import('@/views/MainOrganization/Project/ShowProject.vue'),
    props: true,
    meta: {
      breadcrumb: 'Show project',
      parent: 'project',
    },
  },
  {
    path: 'project/show/:project_id/price-percentage',
    name: 'project-price-percentage',
    component: () => import('@/views/shared/PricePercentage/IndexPricePercentage.vue'),
    props: true,
    meta: {
      breadcrumb: 'price_percentage.title',
      parent: 'show-project',
    },
  },
  {
    path: 'project/show/:project_id/invoice-action/add',
    name: 'project-invoice-action-add',
    component: () => import('@/views/MainOrganization/Invoice/SetInvoiceAction.vue'),
    props: true,
    meta: {
      breadcrumb: 'invoice_action.title',
      parent: 'show-project',
    },
  },
  {
    path: 'project/history/:project_id',
    name: 'project-history',
    component: () => import('@/views/MainOrganization/Project/ProjectHistory.vue'),
    props: true,
    meta: {
      breadcrumb: 'Project history',
      parent: 'project',
    },
  },
];
