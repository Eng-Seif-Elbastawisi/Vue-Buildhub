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
      return 'project.notificationType.normal';
    case NotificationType.URGENT:
      return 'project.notificationType.urgent';
    case NotificationType.LOW:
      return 'project.notificationType.low';
    default:
      return 'unknown';
  }
}
