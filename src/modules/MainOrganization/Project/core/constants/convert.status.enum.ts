/**
 * Convert status enumeration
 */
export const ConvertStatus = {
  WAITING_PREVIEW: 1,
  WAITING_PREVIEW_RESULT: 2,
  WAITING_PRICING: 3,
  READY_TO_SENT: 4,
  CONVERT_TO_PROJECT: 10,
  SEND_TO_CLIENT: 11,
  REVISE_VERSION: 12,
  ACCEPT_CLIENT: 13,
  REJECT_CLIENT: 14,
} as const;

export type ConvertStatus = (typeof ConvertStatus)[keyof typeof ConvertStatus];

/**
 * Get i18n key for ConvertStatus display name
 * Use this with $t() to get localized display names
 */
export function getConvertStatusNameKey(status: ConvertStatus): string {
  switch (status) {
    case ConvertStatus.WAITING_PREVIEW:
      return 'project.convertStatus.waitingPreview';
    case ConvertStatus.WAITING_PREVIEW_RESULT:
      return 'project.convertStatus.waitingPreviewResult';
    case ConvertStatus.WAITING_PRICING:
      return 'project.convertStatus.waitingPricing';
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
    case ConvertStatus.READY_TO_SENT:
      return 'project.convertStatus.readyToSent';
    default:
      return 'unknown';
  }
}
