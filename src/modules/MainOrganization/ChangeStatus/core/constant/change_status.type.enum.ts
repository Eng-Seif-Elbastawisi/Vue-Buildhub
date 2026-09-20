export const StatusTypeEnum = {
  MEASUREMENT_UNIT: 1,
  ITEM_TYPE: 2,
  STAGE: 3,
  PRODUCT: 4,
  MATERIAL: 5,
  LABOR: 6,
  QUOTE_TYPE: 7,
} as const;

export type StatusTypeEnum = (typeof StatusTypeEnum)[keyof typeof StatusTypeEnum];
