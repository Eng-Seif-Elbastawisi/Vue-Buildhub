export const LocationTypeEnum = {
  wareHouse: 1,
  store: 2,
  building: 3,
  apartment: 4,
} as const;

export type LocationTypeEnum = (typeof LocationTypeEnum)[keyof typeof LocationTypeEnum];
