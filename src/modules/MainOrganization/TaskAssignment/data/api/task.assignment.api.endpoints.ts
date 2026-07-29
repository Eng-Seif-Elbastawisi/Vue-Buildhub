import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';
import { useUserStore } from '@/stores/user';

export class TaskAssignmentApiEndpoints extends BaseEndpoints {
  protected get prefix(): string {
    return useUserStore().user?.type === 1 ? 'mainportal/' : 'organization/';
  }

  readonly assignProjectDepartmentItemTask = this.url('assign_project_department_item_task');
  readonly fetchEmployeeTasks = this.url('fetch_employee_tasks');
  readonly setTaskEmployeeStatus = this.url('set_task_employee_status');
  readonly fetchApprovedTasks = this.url('fetch_approved_tasks');

  taskStatusAction(action: string): string {
    if (/^https?:\/\//i.test(action)) return action;

    return this.url(action.replace(/^\/+/, ''));
  }
}
