/**
 * Email type enumeration
 */
export const FloorNumber = {
  BASEMENT: -1,
  GROUND_FLOOR: 0,
  FIRST_FLOOR: 1,
  SECOND_FLOOR: 2,
  THIRD_FLOOR: 3,
  FOURTH_FLOOR: 4,
  FIFTH_FLOOR: 5,
  SIXTH_FLOOR: 6,
  SEVENTH_FLOOR: 7,
  EIGHTH_FLOOR: 8,
  NINTH_FLOOR: 9,
  TENTH_FLOOR: 10,
} as const;

export type FloorNumber = (typeof FloorNumber)[keyof typeof FloorNumber];

/**
 * Get i18n key for email type display name
 * Use this with $t() in components to get localized display names
 */
export function getStatusNameKey(type: FloorNumber): string {
  switch (type) {
    case FloorNumber.GROUND_FLOOR:
      return 'Ground Floor';
    case FloorNumber.FIRST_FLOOR:
      return 'First Floor';
    case FloorNumber.SECOND_FLOOR:
      return 'Second Floor';
    case FloorNumber.THIRD_FLOOR:
      return 'Third Floor';
    default:
      return 'unknown';
  }
}
