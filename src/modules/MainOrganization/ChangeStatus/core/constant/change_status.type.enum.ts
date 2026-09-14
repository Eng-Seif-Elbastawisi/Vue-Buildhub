export const StatusTypeEnum = {
  MEASUREMENT_UNIT: 1,
  ITEM_TYPE: 2,
  STAGE: 3,
} as const;

export type StatusTypeEnum = (typeof StatusTypeEnum)[keyof typeof StatusTypeEnum];
