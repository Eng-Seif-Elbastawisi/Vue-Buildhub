export const UnitTypeEnum = {
  meter: 1,
  bag: 2,
  box: 3,
} as const;

export type UnitTypeEnum = (typeof UnitTypeEnum)[keyof typeof UnitTypeEnum];
