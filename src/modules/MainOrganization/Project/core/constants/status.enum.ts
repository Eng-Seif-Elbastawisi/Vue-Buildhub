/**
 * Email type enumeration
 */
export const Status = {
  READY_FOR_PRICING: 1,
  NEED_ADDITIONAL_VISIT: 2,
  NOT_READY_FOR_COMPLETION: 3,
} as const;

export type Status = (typeof Status)[keyof typeof Status];

/**
 * Get i18n key for email type display name
 * Use this with $t() in components to get localized display names
 */
export function getStatusNameKey(type: Status): string {
  switch (type) {
    case Status.READY_FOR_PRICING:
      return 'project.status.ready_for_pricing';
    case Status.NEED_ADDITIONAL_VISIT:
      return 'project.status.need_additional_visit';
    case Status.NOT_READY_FOR_COMPLETION:
      return 'project.status.not_ready_for_completion';
    default:
      return 'unknown';
  }
}
