import type { RouteRecordRaw } from '@/router/types';
import { documentRoutes } from '../modules/document';

export const adminRoutes: RouteRecordRaw[] = [...documentRoutes];
