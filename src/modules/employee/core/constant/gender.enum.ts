export const GenderENum = {
  male: 1,
  female: 2,
} as const;

export type GenderENum = (typeof GenderENum)[keyof typeof GenderENum];
