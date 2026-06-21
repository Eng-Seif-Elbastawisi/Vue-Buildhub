import type { RouteRecordRaw } from 'vue-router';
// import { countryRoutes } from './country';
import { SuppliersRoutes } from './Suppliers';
import { ClientRoutes } from './client';

export const dashboardRoutes: RouteRecordRaw[] = [
  // ...countryRoutes,
  ...SuppliersRoutes,
  ...ClientRoutes,
];
