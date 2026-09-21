import type { RouteRecordRaw } from 'vue-router';
// import { countryRoutes } from './country';
import { SuppliersRoutes } from './Suppliers';
import { ClientRoutes } from './client';
import { EmployeeRoutes } from './employee';
import { SpecializationRoutes } from './specialization';
import { TermRoutes } from './term';
import { ProjectRoutes } from './project';
import { SystemIdentityRoutes } from '../shared/systemIdentity';
import { ProjectPreviewRoutes } from './project_preview';
import { ProjectPricingRoutes } from './project_pricing';
import { ProjectFloorRoutes } from './project_floor';
import { InvoiceRoutes } from './invoice';
import { InvoicePaymentRoutes } from './invoice_payment';
import { TaskAssignmentRoutes } from './task_assignment';
import { OrganizationPackageRoutes } from './organization_package';
import { ItemTypesRoutes } from './item.types';
import { ProductsRoutes } from './products';
import { LaborRoutes } from './labor';
import { quoteTypesRoutes } from './quote_types';
import { executionQuoteRoutes } from './execution_quotes';

export const dashboardRoutes: RouteRecordRaw[] = [
  // ...countryRoutes,
  ...SystemIdentityRoutes,
  ...SuppliersRoutes,
  ...ClientRoutes,
  ...EmployeeRoutes,
  ...SpecializationRoutes,
  ...TermRoutes,
  ...ProjectRoutes,
  ...TaskAssignmentRoutes,
  ...ProjectPreviewRoutes,
  ...ProjectPricingRoutes,
  ...ProjectFloorRoutes,
  ...InvoiceRoutes,
  ...InvoicePaymentRoutes,
  ...OrganizationPackageRoutes,
  ...ItemTypesRoutes,
  ...ProductsRoutes,
  ...quoteTypesRoutes,
  ...LaborRoutes,
  ...quoteTypesRoutes,
  ...executionQuoteRoutes,
];
