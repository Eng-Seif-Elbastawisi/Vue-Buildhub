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
import { ClientSourceRoutes } from './clientsource';
import { supplyRoutes } from './supply';
import { LocationGovernorateRoutes } from './location_governorate';
import { LocationCityRoutes } from './location_city';
import { SystemIdentityRoutes } from './systemIdentity';
import { SpaceRoutes } from './space';
import { projectItemRoutes } from './projectItem';

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
  ...supplyRoutes,
  ...LocationRoutes,
  ...measurementRoutes,
  ...ClientSourceRoutes,
  ...LocationGovernorateRoutes,
  ...LocationCityRoutes,
  ...SystemIdentityRoutes,
  ...SpaceRoutes,
  ...projectItemRoutes,
];
