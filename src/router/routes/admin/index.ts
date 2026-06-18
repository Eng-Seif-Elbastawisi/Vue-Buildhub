import type { RouteRecordRaw } from '@/router/types';
import { documentRoutes } from '../modules/document';
import { organizationRoutes } from './Organization';

export const adminRoutes: RouteRecordRaw[] = [...documentRoutes, ...organizationRoutes];
