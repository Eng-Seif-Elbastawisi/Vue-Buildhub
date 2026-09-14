export const ItemTypeEnum = {
  PRODUCTS: 1,
  MATERIALS: 2,
  LABOR: 3,
} as const;

export type ItemTypeEnum = (typeof ItemTypeEnum)[keyof typeof ItemTypeEnum];
