export const StatusTypeEnum = {
  MEASUREMENT: 1,
  MEASUREMENT_UNIT: 2,
  ITEM_TYPE: 3,
  STAGE: 4,
} as const;

export type StatusTypeEnum = (typeof StatusTypeEnum)[keyof typeof StatusTypeEnum];
