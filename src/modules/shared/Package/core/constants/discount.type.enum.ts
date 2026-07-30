export const DiscountType = {
  PERCENTAGE: 1,
  VALUE: 2,
} as const;

export type DiscountType = (typeof DiscountType)[keyof typeof DiscountType];

export function getDiscountTypeNameKey(discountType: DiscountType): string {
  switch (discountType) {
    case DiscountType.PERCENTAGE:
      return 'package.discount.percentage';
    case DiscountType.VALUE:
      return 'package.discount.value';
    default:
      return 'unknown';
  }
}
