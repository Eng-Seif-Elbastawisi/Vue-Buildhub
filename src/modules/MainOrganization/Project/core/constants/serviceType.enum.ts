/**
 * Email type enumeration
 */
export const ServiceType = {
  DESIGNONLY: 1,
  EXECUTIONONLY: 2,
  BOTH: 3,
} as const;

export type ServiceType = (typeof ServiceType)[keyof typeof ServiceType];

/**
 * Get i18n key for email type display name
 * Use this with $t() in components to get localized display names
 */
export function getServiceTypeNameKey(type: ServiceType): string {
  switch (type) {
    case ServiceType.DESIGNONLY:
      return 'designOnly';
    case ServiceType.EXECUTIONONLY:
      return 'executionOnly';
    case ServiceType.BOTH:
      return 'both';
    default:
      return 'unknown';
  }
}
