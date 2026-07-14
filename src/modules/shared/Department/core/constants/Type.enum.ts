/**
 * Department type enumeration
 */
export const Type = {
  DESIGN: 1,
  SUPERVISION: 2,
  BOTH: 3,
} as const;

export type Type = (typeof Type)[keyof typeof Type];

/**
 * Get i18n key for department type display name
 * Use this with $t() in components to get localized display names
 */
export function getTypeNameKey(type: Type): string {
  switch (type) {
    case Type.DESIGN:
      return 'types.design';
    case Type.SUPERVISION:
      return 'types.supervision';
    case Type.BOTH:
      return 'types.both';
    default:
      return 'unknown';
  }
}
