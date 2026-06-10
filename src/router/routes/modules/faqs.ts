import type { RouteRecordRaw } from '@/router/types';

export const faqsRoutes: RouteRecordRaw[] = [
  {
    path: 'faqs',
    name: 'Faqs',
    component: () => import('@/views/faqs/IndexFaqs.vue'),
    meta: {
      breadcrumb: 'Faqs',
      title: 'FAQs',
      searchable: true,
    },
  },
  {
    path: 'faqs/add',
    name: 'FaqsAdd',
    component: () => import('@/views/faqs/AddFaqs.vue'),
    meta: {
      breadcrumb: 'Add FAQ',
      searchable: false,
    },
  },
  {
    path: 'faqs/:id/edit',
    name: 'FaqsEdit',
    component: () => import('@/views/faqs/EditFaqs.vue'),
    meta: {
      breadcrumb: 'Edit FAQ',
      searchable: false,
    },
  },
];
