export const SiteSafetyStatus = { OK: 1, Observation: 2, Incident: 3 } as const;
export type SiteSafetyStatus = (typeof SiteSafetyStatus)[keyof typeof SiteSafetyStatus];
export const WorkActivityType = { Meeting: 1, Issue: 2, Risk: 3, Delay: 4 } as const;
export type WorkActivityType = (typeof WorkActivityType)[keyof typeof WorkActivityType];
export const positiveId = (id: unknown): boolean =>
  typeof id === 'number' && Number.isInteger(id) && id > 0;
export function dateOnly(date: unknown): boolean {
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const [year, month, day] = date.split('-').map(Number);
  if (!year || !month || !day || month > 12) return false;
  const days = [
    31,
    year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  return day <= (days[month - 1] ?? 0);
}
