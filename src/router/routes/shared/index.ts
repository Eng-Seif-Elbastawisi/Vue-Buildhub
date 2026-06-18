import type { RouteRecordRaw } from '@/router/types';
import { faqsRoutes } from '../modules/faqs';
import { organizationRoutes } from '../admin/Organization';
import { itemRoutes } from '../admin/Item';
import { adminCrudRoutes } from '../admin/admin';

export const sharedRoutes: RouteRecordRaw[] = [
  ...faqsRoutes,
  ...organizationRoutes,
  ...itemRoutes,
  ...adminCrudRoutes,
];
