import type { RouteRecordRaw } from '@/router/types';
import { documentRoutes } from '../modules/document';
import { organizationRoutes } from './Organization';
import { itemRoutes } from './Item';
import { adminCrudRoutes } from './admin';

export const adminRoutes: RouteRecordRaw[] = [
  ...documentRoutes,
  ...organizationRoutes,
  ...itemRoutes,
  ...adminCrudRoutes,
];
