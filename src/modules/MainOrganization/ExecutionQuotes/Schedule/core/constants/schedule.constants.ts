import { TaskDurationType } from '@/modules/MainOrganization/TaskAssignment/core/constants/taskDurationType.enum';
export { getTypeNameKey } from '@/modules/MainOrganization/TaskAssignment/core/constants/taskDurationType.enum';
export type { TaskDurationType } from '@/modules/MainOrganization/TaskAssignment/core/constants/taskDurationType.enum';
// Reuse the existing numeric transport enum, including Month and Year (not Hours).
export const durationTypes = Object.values(TaskDurationType);
export function isDurationType(value: unknown): value is TaskDurationType {
  return typeof value === 'number' && durationTypes.some((unit) => unit === value);
}
export const weekdays = [0, 1, 2, 3, 4, 5, 6] as const;
export function validId(id: number): boolean {
  return Number.isSafeInteger(id) && id > 0;
}
export function dayOptionDisabled(selected: readonly number[], day: number): boolean {
  return selected.length >= 2 && !selected.includes(day);
}
export const scheduleContractError = 'schedule.integration_pending';
