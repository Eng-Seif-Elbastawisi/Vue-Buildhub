import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useUserStore } from '@/stores/user';
import { TaskAssignmentApiEndpoints } from '../task.assignment.api.endpoints';

vi.mock('@/stores/user', () => ({
  useUserStore: vi.fn(() => ({ user: { type: 1 } })),
}));

describe('TaskAssignmentApiEndpoints', () => {
  beforeEach(() => {
    vi.mocked(useUserStore).mockReturnValue({ user: { type: 1 } } as never);
  });

  it('builds mainportal task assignment endpoints for master users', () => {
    const endpoints = new TaskAssignmentApiEndpoints();

    expect(endpoints.assignProjectDepartmentItemTask).toContain(
      'mainportal/assign_project_department_item_task',
    );
    expect(endpoints.fetchEmployeeTasks).toContain('mainportal/fetch_employee_tasks');
    expect(endpoints.changeInsideStatus).toContain('mainportal/change_inside_status');
    expect(endpoints.taskStatusAction('update_employee_task_status')).toContain(
      'mainportal/update_employee_task_status',
    );
  });

  it('builds organization task assignment endpoints for non-master users', () => {
    vi.mocked(useUserStore).mockReturnValue({ user: { type: 2 } } as never);

    const endpoints = new TaskAssignmentApiEndpoints();

    expect(endpoints.assignProjectDepartmentItemTask).toContain(
      'organization/assign_project_department_item_task',
    );
    expect(endpoints.fetchEmployeeTasks).toContain('organization/fetch_employee_tasks');
    expect(endpoints.changeInsideStatus).toContain('organization/change_inside_status');
  });
});
