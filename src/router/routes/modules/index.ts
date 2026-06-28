import type { RouteRecordRaw } from 'vue-router';
// import { countryRoutes } from './country';
import { SuppliersRoutes } from './Suppliers';
import { ClientRoutes } from './client';
import { EmployeeRoutes } from './employee';
import { SpecializationRoutes } from './specialization';

export const dashboardRoutes: RouteRecordRaw[] = [
  // ...countryRoutes,
  ...SuppliersRoutes,
  ...ClientRoutes,
  ...EmployeeRoutes,
  ...SpecializationRoutes,
];
