export const TaskEmployeeStatusEnum = {
  START_EMPLOYEE: 20,
  HOLD_EMPLOYEE: 21,
  FINISH_EMPLOYEE: 22,
} as const;
export type TaskEmployeeStatusEnum = (typeof TaskEmployeeStatusEnum)[keyof typeof TaskEmployeeStatusEnum];
export const Type = TaskEmployeeStatusEnum;
export type Type = TaskEmployeeStatusEnum;

/**
 * Get i18n key for department type display name
 * Use this with $t() in components to get localized display names
 */
export function getTypeNameKey(type: TaskEmployeeStatusEnum): string {
    switch (type) {
        case TaskEmployeeStatusEnum.START_EMPLOYEE:
            return 'task_assignment.employee.start';
        case TaskEmployeeStatusEnum.HOLD_EMPLOYEE:
            return 'task_assignment.employee.hold';
        case TaskEmployeeStatusEnum.FINISH_EMPLOYEE:
            return 'task_assignment.employee.finish';
        default:
            return 'task_assignment.inside.assigned';
    }
}
