import type { RouteRecordRaw } from 'vue-router';
// import { countryRoutes } from './country';
import { employeeRoutes } from './employee';
import { documentRoutes } from './document';
import { faqsRoutes } from './faqs';
import { privacyRoutes } from './privacy';
import { termsConditionsRoutes } from './terms-conditions';
import { stagesRoutes } from './stages';
import { subjectsRoutes } from './subjects';
import { unitsRoutes } from './units';
import { educationClassificationRoutes } from './education-classification';
import { AboutRoutes } from './about';
import { SupportContactsRoutes } from './support';
import { DeletedAccountsRoutes } from './deleted-accounts';
import { SkillsRoutes } from './skills';
import { questionsRoutes } from './question';
import { ArticlesRoutes } from './Articles';
import { PackagesRoutes } from './package';

export const dashboardRoutes: RouteRecordRaw[] = [
  // ...countryRoutes,
  ...employeeRoutes,
  ...documentRoutes,
  ...faqsRoutes,
  ...privacyRoutes,
  ...termsConditionsRoutes,
  ...stagesRoutes,
  ...subjectsRoutes,
  ...unitsRoutes,
  ...educationClassificationRoutes,
  ...AboutRoutes,
  ...SupportContactsRoutes,
  ...DeletedAccountsRoutes,
  ...SkillsRoutes,
  ...questionsRoutes,
  ...ArticlesRoutes,
  ...PackagesRoutes,
];
