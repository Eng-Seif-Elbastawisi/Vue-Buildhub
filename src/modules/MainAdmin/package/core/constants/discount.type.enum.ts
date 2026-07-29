import type {} from '@/modules/MainOrganization/Project/core/constants/convert.status.enum';

export const DiscountType = {
  PERCENTAGE: 1,
  VALUE: 2,
} as const;

export type DiscountType = (typeof DiscountType)[keyof typeof DiscountType];

export function getDiscountTypeNameKey(status: DiscountType): string {
  switch (status) {
    case DiscountType.PERCENTAGE:
      return 'package.discount.percentage';
    case DiscountType.VALUE:
      return 'package.discount.value';
    default:
      return 'unknown';
  }
}
