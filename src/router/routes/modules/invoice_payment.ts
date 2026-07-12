import type { RouteRecordRaw } from '@/router/types';

export const InvoicePaymentRoutes: RouteRecordRaw[] = [
  {
    path: 'invoice-payment',
    name: 'Invoice Payment',
    component: () => import('@/views/MainOrganization/InvoicePayment/IndexInvoicePayment.vue'),
    meta: {
      breadcrumb: 'Invoice Payment',
    },
  },
  {
    path: 'invoice-payment/add',
    name: 'Add Invoice Payment',
    component: () => import('@/views/MainOrganization/InvoicePayment/AddInvoicePayment.vue'),
    meta: {
      breadcrumb: 'Add Invoice Payment',
      parent: 'Invoice Payment',
    },
  },
  {
    path: 'invoice-payment/edit/:id',
    name: 'Edit Invoice Payment',
    component: () => import('@/views/MainOrganization/InvoicePayment/EditInvoicePayment.vue'),
    props: true,
    meta: {
      breadcrumb: 'Edit Invoice Payment',
      parent: 'Invoice Payment',
    },
  },
];
