export const ItemServiceTypeEnum = {
  DESIGN: 1,
  SUPERVISION: 2,
  BOTH: 3,
} as const;

export type ItemServiceTypeEnum = (typeof ItemServiceTypeEnum)[keyof typeof ItemServiceTypeEnum];
