import type {} from '@/modules/MainOrganization/Project/core/constants/convert.status.enum';

export const DurationType = {
  DAY: 1,
  WEEK: 2,
  MONTH: 3,
  YEAR: 4,
} as const;

export type DurationType = (typeof DurationType)[keyof typeof DurationType];

export function getDurationTypeNameKey(status: DurationType): string {
  switch (status) {
    case DurationType.DAY:
      return 'package.duration.day';
    case DurationType.WEEK:
      return 'package.duration.week';
    case DurationType.MONTH:
      return 'package.duration.month';
    case DurationType.YEAR:
      return 'package.duration.year';
    default:
      return 'unknown';
  }
}
