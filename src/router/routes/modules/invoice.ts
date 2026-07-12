import type { RouteRecordRaw } from '@/router/types';

export const InvoiceRoutes: RouteRecordRaw[] = [
  {
    path: 'invoice',
    name: 'Invoice',
    component: () => import('@/views/MainOrganization/Invoice/IndexInvoice.vue'),
    meta: {
      breadcrumb: 'Invoice',
    },
  },
  {
    path: 'invoice/add',
    name: 'Add Invoice',
    component: () => import('@/views/MainOrganization/Invoice/AddInvoice.vue'),
    meta: {
      breadcrumb: 'Add Invoice',
      parent: 'Invoice',
    },
  },
  {
    path: 'invoice/edit/:id',
    name: 'Edit Invoice',
    component: () => import('@/views/MainOrganization/Invoice/EditInvoice.vue'),
    props: true,
    meta: {
      breadcrumb: 'Edit Invoice',
      parent: 'Invoice',
    },
  },
];
