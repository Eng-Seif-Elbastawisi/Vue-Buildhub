export const DurationTypeEnum = {
  HOUR: 1,
  DAY: 2,
  WEEK: 3,
  MONTH: 4,
  YEAR: 5,
} as const;

export type DurationTypeEnum = (typeof DurationTypeEnum)[keyof typeof DurationTypeEnum];
