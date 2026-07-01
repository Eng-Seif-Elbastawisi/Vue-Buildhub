export const ClientTypeEnum = {
  INDIVIDUAL: 1,
  COMPANY: 2,
  DEVELOPER: 3,
} as const;

export type ClientTypeEnum = (typeof ClientTypeEnum)[keyof typeof ClientTypeEnum];
