/**
 * Convert status enumeration
 */
export const ConvertStatus = {
  PENDING: 1,
  CONVERT_TO_PROJECT: 2,
  SEND_TO_CLIENT: 3,
  REVISE_VERSION: 4,
  ACCEPT_CLIENT: 5,
  REJECT_CLIENT: 6,
} as const;
export type ConvertStatus = (typeof ConvertStatus)[keyof typeof ConvertStatus];

/**
 * Get i18n key for ConvertStatus display name
 * Use this with $t() to get localized display names
 */
export function getConvertStatusNameKey(status: ConvertStatus): string {
  switch (status) {
    case ConvertStatus.PENDING:
      return 'project.convertStatus.pending';
    case ConvertStatus.CONVERT_TO_PROJECT:
      return 'project.convertStatus.convertToProject';
    case ConvertStatus.SEND_TO_CLIENT:
      return 'project.convertStatus.sendToClient';
    case ConvertStatus.REVISE_VERSION:
      return 'project.convertStatus.reviseVersion';
    case ConvertStatus.ACCEPT_CLIENT:
      return 'project.convertStatus.acceptClient';
    case ConvertStatus.REJECT_CLIENT:
      return 'project.convertStatus.rejectClient';
    default:
      return 'unknown';
  }
}
