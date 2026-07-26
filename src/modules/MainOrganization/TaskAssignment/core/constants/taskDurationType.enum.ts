export const TaskDurationType = {
  DAY: 1,
  WEEK: 2,
  MONTH: 3,
  YEAR: 4,
} as const;

export type TaskDurationType = (typeof TaskDurationType)[keyof typeof TaskDurationType];
export const Type = TaskDurationType;
export type Type = TaskDurationType;

/**
 * Get i18n key for department type display name
 * Use this with $t() in components to get localized display names
 */
export function getTypeNameKey(type: TaskDurationType): string {
  switch (type) {
    case TaskDurationType.DAY:
      return 'task_assignment.duration_types.day';
    case TaskDurationType.WEEK:
      return 'task_assignment.duration_types.week';
    case TaskDurationType.MONTH:
      return 'task_assignment.duration_types.month';
    case TaskDurationType.YEAR:
      return 'task_assignment.duration_types.year';
    default:
      return 'task_assignment.duration_types.day';
  }
}
