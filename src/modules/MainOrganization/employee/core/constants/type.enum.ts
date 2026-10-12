/**
 * Email type enumeration
 */
export const EmployeeType = {
  EMPLOYEE: 1,
  ENGINEER: 2,
  SELLER: 3,
  PRICING_RESPONSIBLE: 4,
  REVIEWER: 5,
  TEAM_LEADER: 6,
  SITE_ENGINEER: 7,
  PROJECT_MANAGER: 8
} as const;

export type EmployeeType = (typeof EmployeeType)[keyof typeof EmployeeType];

/**
 * Get i18n key for email type display name
 * Use this with $t() in components to get localized display names
 */

import { translate } from '@/locales/i18n';

export function getStatusNameKey(type: EmployeeType): string {
  switch (type) {
    case EmployeeType.EMPLOYEE:
      return translate('project.status.employee');
    case EmployeeType.ENGINEER:
      return translate('project.status.engineer');
    case EmployeeType.SELLER:
      return translate('project.status.seller');
    case EmployeeType.PRICING_RESPONSIBLE:
      return translate('project.status.pricing_responsible');
    case EmployeeType.REVIEWER:
      return translate('project.status.reviewer');
    case EmployeeType.TEAM_LEADER:
      return translate('project.status.team_leader');
    case EmployeeType.SITE_ENGINEER:
      return translate('project.status.site_engineer');
    case EmployeeType.PROJECT_MANAGER:
      return translate('project.status.project_manager');
    default:
      return 'unknown';
  }
}
