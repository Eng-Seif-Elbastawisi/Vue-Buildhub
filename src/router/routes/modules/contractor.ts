import type { RouteRecordRaw } from '@/router/types';

export const ContractorRoutes: RouteRecordRaw[] = [
  {
    path: 'contractors',
    name: 'Contractors',
    component: () => import('@/views/MainOrganization/Contractor/IndexContractor.vue'),
    meta: { breadcrumb: 'Contractor.list_title' },
  },
  {
    path: 'contractors/add',
    name: 'Add Contractor',
    component: () => import('@/views/MainOrganization/Contractor/AddContractor.vue'),
    meta: { breadcrumb: 'Contractor.add', parent: 'Contractor.list_title' },
  },
  {
    path: 'contractors/edit/:contractor_id',
    name: 'Edit Contractor',
    component: () => import('@/views/MainOrganization/Contractor/EditContractor.vue'),
    props: true,
    meta: { breadcrumb: 'Contractor.edit', parent: 'Contractor.list_title' },
  },
  {
    path: 'contractors/show/:contractor_id',
    name: 'Show Contractor',
    component: () => import('@/views/MainOrganization/Contractor/ShowContractor.vue'),
    props: true,
    meta: { breadcrumb: 'Contractor.show', parent: 'Contractor.list_title' },
  },
];
