/**
 * Department type enumeration
 */
export const DepartmentTypeEnum = {
  DESIGN: 1,
  SUPERVISION: 2,
  BOTH: 3,
} as const;

export type DepartmentTypeEnum = (typeof DepartmentTypeEnum)[keyof typeof DepartmentTypeEnum];
export const Type = DepartmentTypeEnum;
export type Type = DepartmentTypeEnum;

/**
 * Get i18n key for department type display name
 * Use this with $t() in components to get localized display names
 */
export function getTypeNameKey(type: DepartmentTypeEnum): string {
  switch (type) {
    case DepartmentTypeEnum.DESIGN:
      return 'types.design';
    case DepartmentTypeEnum.SUPERVISION:
      return 'types.supervision';
    case DepartmentTypeEnum.BOTH:
      return 'types.both';
    default:
      return 'unknown';
  }
}
