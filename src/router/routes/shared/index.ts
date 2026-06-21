import type { RouteRecordRaw } from '@/router/types';
import { organizationRoutes } from './Organization';
import { itemRoutes } from './Item';
import { adminCrudRoutes } from '../admin/admin';
import { BrandRoutes } from './brand';
import { departmentRoutes } from './department';
import { ProjectTypeRoutes } from './projectType';
import { stagesRoutes } from './stages';
import { termRoutes } from './term';
import { MaterialRoutes } from './material';
import { LocationRoutes } from './location';
import { measurementRoutes } from './measurement';

export const sharedRoutes: RouteRecordRaw[] = [
  ...organizationRoutes,
  ...itemRoutes,
  ...adminCrudRoutes,
  ...BrandRoutes,
  ...departmentRoutes,
  ...ProjectTypeRoutes,
  ...stagesRoutes,
  ...termRoutes,
  ...MaterialRoutes,
  ...LocationRoutes,
  ...measurementRoutes,
];
