import type { RouteRecordRaw } from 'vue-router';

export const AttachmentTypeRoutes: RouteRecordRaw[] = [
  {
    path: 'attachment-types',
    name: 'attachment-types',
    component: () => import('@/views/MainOrganization/AttachmentType/IndexAttachmentType.vue'),
    meta: {
      breadcrumb: 'attachment_types',
    },
  },
  {
    path: 'attachment-types/add',
    name: 'add-attachment-type',
    component: () => import('@/views/MainOrganization/AttachmentType/AddAttachmentType.vue'),
    meta: {
      breadcrumb: 'attachment_type.add',
      parent: 'attachment-types',
    },
  },
  {
    path: 'attachment-types/edit/:id(\\d+)',
    name: 'edit-attachment-type',
    component: () => import('@/views/MainOrganization/AttachmentType/EditAttachmentType.vue'),
    props: true,
    meta: {
      breadcrumb: 'attachment_type.edit',
      parent: 'attachment-types',
    },
  },
];
