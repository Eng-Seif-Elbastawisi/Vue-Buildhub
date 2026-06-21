export const EducationType = {
  General: 1,
  Technical: 2,
} as const;

export type EducationType = (typeof EducationType)[keyof typeof EducationType];
