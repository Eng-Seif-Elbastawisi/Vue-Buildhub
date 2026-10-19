export const ProjectWorkStatus = { START: 1, HOLD: 2, STOP: 3 } as const;
export type ProjectWorkStatus = (typeof ProjectWorkStatus)[keyof typeof ProjectWorkStatus];

export function isProjectWorkStatus(value: unknown): value is ProjectWorkStatus {
  return value === 1 || value === 2 || value === 3;
}
