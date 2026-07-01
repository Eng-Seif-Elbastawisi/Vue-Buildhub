export const LocationTypeEnum = {
  COUNTRY: 1,
  GOVERNORATE: 2,
  CITY: 3,
  REGION: 4,
  PLACE: 5,
} as const;

export type LocationTypeEnum = (typeof LocationTypeEnum)[keyof typeof LocationTypeEnum];
