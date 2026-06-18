import type { RouteRecordRaw } from '@/router/types';
import { faqsRoutes } from '../modules/faqs';
import { organizationRoutes } from '../admin/Organization';

export const sharedRoutes: RouteRecordRaw[] = [...faqsRoutes, ...organizationRoutes];
