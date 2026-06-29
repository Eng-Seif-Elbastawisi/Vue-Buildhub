/**
 * Email type enumeration
 */
export const EmployeeType = {
  EMPLOYEE: 1,
  ENGINEER: 2,
  SELLER: 3,
  PRICING_RESPONSIBLE: 4,
} as const;


export type EmployeeType = (typeof EmployeeType)[keyof typeof EmployeeType];

/**
 * Get i18n key for email type display name
 * Use this with $t() in components to get localized display names
 */
export function getStatusNameKey(type: EmployeeType): string {
  switch (type) {
    case EmployeeType.EMPLOYEE:
      return 'project.status.employee';
    case EmployeeType.ENGINEER:
      return 'project.status.engineer';
    case EmployeeType.SELLER:
      return 'project.status.seller';
    case EmployeeType.PRICING_RESPONSIBLE:
      return 'project.status.pricing_responsible';
    default:
      return 'unknown';
  }
}
