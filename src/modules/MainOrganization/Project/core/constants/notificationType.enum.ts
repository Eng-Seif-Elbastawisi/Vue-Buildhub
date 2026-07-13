/**
 * Email type enumeration
 */
export const NotificationType = {
  NORMAL: 1,
  URGENT: 2,
  LOW: 3,
} as const;

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

/**
 * Get i18n key for NotificationType display name
 * Use this with $t() to get localized display names
 */
export function getNotificationTypeNameKey(type: NotificationType): string {
  switch (type) {
    case NotificationType.NORMAL:
      return 'normal';
    case NotificationType.URGENT:
      return 'urgent';
    case NotificationType.LOW:
      return 'low';
    default:
      return 'unknown';
  }
}
