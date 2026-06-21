import type { RouteRecordRaw } from 'vue-router';
// import { countryRoutes } from './country';
import { termsConditionsRoutes } from './terms-conditions';
import { SuppliersRoutes } from './Suppliers';
import { ClientRoutes } from './client';

export const dashboardRoutes: RouteRecordRaw[] = [
  // ...countryRoutes,
  ...termsConditionsRoutes,
  ...SuppliersRoutes,
  ...ClientRoutes,
];
