export const ProjectPricingDiscountEnum = {
  FIXED: 1,
  PERCENTAGE: 2,
} as const;

export type ProjectPricingDiscountEnum =
  (typeof ProjectPricingDiscountEnum)[keyof typeof ProjectPricingDiscountEnum];
