export const ProjectPricingDiscountEnum = {
  FIXED: 1,
  PERCENTAGE: 2,
} as const;

export type ProjectPricingDiscountEnum =
  (typeof ProjectPricingDiscountEnum)[keyof typeof ProjectPricingDiscountEnum];

export const isValidProjectPricingDiscount = (
  discountType?: ProjectPricingDiscountEnum,
  discountValue?: number,
): boolean =>
  discountType !== ProjectPricingDiscountEnum.PERCENTAGE ||
  (typeof discountValue === 'number' &&
    Number.isFinite(discountValue) &&
    discountValue >= 0 &&
    discountValue <= 100);
