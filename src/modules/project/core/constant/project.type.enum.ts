export const ProjectTypeEnum = {
  department: 1,
  teams: 2,
  village: 3,
  commercial: 4,
  industrial: 5,
  other: 6,
} as const;

export type ProjectTypeEnum = (typeof ProjectTypeEnum)[keyof typeof ProjectTypeEnum];
