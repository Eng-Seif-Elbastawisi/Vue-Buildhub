export const BrandTypeEnum = {
  MATERIALS: 1,
  SUPPLIES: 2,
} as const;

export type BrandTypeEnum = (typeof BrandTypeEnum)[keyof typeof BrandTypeEnum];
