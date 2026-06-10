export const BreadcrumbModeEnum = {
  Default: 1,
  Feature: 2,
} as const;

export type BreadcrumbModeEnum = (typeof BreadcrumbModeEnum)[keyof typeof BreadcrumbModeEnum];
