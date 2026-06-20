export const ItemStatusEnum = {
  MAIN: 1,
  OPTIONAL: 2,
} as const;

export type ItemStatusEnum = (typeof ItemStatusEnum)[keyof typeof ItemStatusEnum];
