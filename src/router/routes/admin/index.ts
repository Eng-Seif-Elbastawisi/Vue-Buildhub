import type { RouteRecordRaw } from '@/router/types';
import { organizationRoutes } from '../shared/Organization';
import { itemRoutes } from '../shared/Item';
import { adminCrudRoutes } from './admin';

export const adminRoutes: RouteRecordRaw[] = [
  ...organizationRoutes,
  ...itemRoutes,
  ...adminCrudRoutes,
];
