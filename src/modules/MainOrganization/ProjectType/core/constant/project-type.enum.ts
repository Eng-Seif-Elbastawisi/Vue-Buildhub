export const ProjectType = {
  department: 1,
  teams: 2,
  village: 3,
  commercial: 4,
  industrial: 5,
  other: 6,
} as const;

export type ProjectType = (typeof ProjectType)[keyof typeof ProjectType];
