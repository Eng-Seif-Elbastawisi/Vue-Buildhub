/**
 * Floor number enumeration
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

export function getFloorNumberNameKey(type?: number | FloorNumber | null): string {
  switch (Number(type)) {
    case FloorNumber.BASEMENT:
      return 'project.BASEMENT';
    case FloorNumber.GROUND_FLOOR:
      return 'project.GROUND_FLOOR';
    case FloorNumber.FIRST_FLOOR:
      return 'project.FIRST_FLOOR';
    case FloorNumber.SECOND_FLOOR:
      return 'project.SECOND_FLOOR';
    case FloorNumber.THIRD_FLOOR:
      return 'project.THIRD_FLOOR';
    case FloorNumber.FOURTH_FLOOR:
      return 'project.FOURTH_FLOOR';
    case FloorNumber.FIFTH_FLOOR:
      return 'project.FIFTH_FLOOR';
    case FloorNumber.SIXTH_FLOOR:
      return 'project.SIXTH_FLOOR';
    case FloorNumber.SEVENTH_FLOOR:
      return 'project.SEVENTH_FLOOR';
    case FloorNumber.EIGHTH_FLOOR:
      return 'project.EIGHTH_FLOOR';
    case FloorNumber.NINTH_FLOOR:
      return 'project.NINTH_FLOOR';
    case FloorNumber.TENTH_FLOOR:
      return 'project.TENTH_FLOOR';
    default:
      return 'unknown';
  }
}
