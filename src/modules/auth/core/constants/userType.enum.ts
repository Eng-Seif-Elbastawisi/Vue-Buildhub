export const UserType = {
  ADMIN: 1,
  ORGANIZATION: 2,
} as const;

export type UserType = (typeof UserType)[keyof typeof UserType];
