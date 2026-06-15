import type { RouteRecordRaw } from '@/router/types';
import { faqsRoutes } from '../modules/faqs';

export const sharedRoutes: RouteRecordRaw[] = [...faqsRoutes];
