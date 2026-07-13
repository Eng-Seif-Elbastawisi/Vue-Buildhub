/**
 * Convert status enumeration
 */
export const ConvertStatus = {
  PENDING: 1,
  CONVERT_TO_PROJECT: 2,
  SEND_TO_CLIENT: 3,
  REVISE_VERSION: 4,
} as const;
export type ConvertStatus = (typeof ConvertStatus)[keyof typeof ConvertStatus];

/**
 * Get i18n key for ConvertStatus display name
 * Use this with $t() to get localized display names
 */
export function getConvertStatusNameKey(status: ConvertStatus): string {
  switch (status) {
    case ConvertStatus.PENDING:
      return 'pending';
    case ConvertStatus.CONVERT_TO_PROJECT:
      return 'convert To Project';
    case ConvertStatus.SEND_TO_CLIENT:
      return 'send To Client';
    case ConvertStatus.REVISE_VERSION:
      return 'revise Version';
    default:
      return 'unknown';
  }
}
