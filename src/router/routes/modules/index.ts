import type { RouteRecordRaw } from 'vue-router';
// import { countryRoutes } from './country';
import { SuppliersRoutes } from './Suppliers';
import { ClientRoutes } from './client';
import { EmployeeRoutes } from './employee';
import { SpecializationRoutes } from './specialization';
import { ProjectRoutes } from './project';
import { SystemIdentityRoutes } from '../shared/systemIdentity';
import { ProjectPreviewRoutes } from './project_preview';

export const dashboardRoutes: RouteRecordRaw[] = [
  // ...countryRoutes,
  ...SystemIdentityRoutes,
  ...SuppliersRoutes,
  ...ClientRoutes,
  ...EmployeeRoutes,
  ...SpecializationRoutes,
  ...ProjectRoutes,
  ...ProjectPreviewRoutes,
];
