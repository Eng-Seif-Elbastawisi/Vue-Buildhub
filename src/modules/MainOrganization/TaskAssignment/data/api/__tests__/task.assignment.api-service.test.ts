import { describe, expect, it, vi } from 'vitest';
import TaskAssignmentApiService from '../task.assignment.api-service';

vi.mock('@/stores/user', () => ({
  useUserStore: vi.fn(() => ({ user: { type: 1 } })),
}));

describe('TaskAssignmentApiService', () => {
  it('returns the same singleton instance', () => {
    expect(TaskAssignmentApiService.getInstance()).toBe(TaskAssignmentApiService.getInstance());
  });

  it('sends task assignment requests through customPost', async () => {
    const service = TaskAssignmentApiService.getInstance();
    const spy = vi.spyOn(service, 'customPost').mockResolvedValue({} as never);

    await service.assignProjectDepartmentItemTask({
      project_department_item_id: 39,
      employee_ids: [16, 20],
      notes: 'Review',
    });
    await service.fetchEmployeeTasks({ page: 1, per_page: 10 });
    await service.changeEmployeeTaskStatus('update_employee_task_status', {
      task_id: 7,
      status: 'done',
    });

    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('/mainportal/assign_project_department_item_task'),
      {
        project_department_item_id: 39,
        employee_ids: [16, 20],
        notes: 'Review',
      },
    );
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('/mainportal/fetch_employee_tasks'), {
      page: 1,
      per_page: 10,
    });
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('/mainportal/update_employee_task_status'),
      {
        task_id: 7,
        status: 'done',
      },
    );
  });
});
