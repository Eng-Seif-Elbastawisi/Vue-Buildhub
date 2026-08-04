import { describe, expect, it, vi } from 'vitest';
import {
  DataFailed,
  DataSuccess,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import TaskAssignmentEmployeeTaskModel from '../../../core/models/task.assignment.employee-task.model';
import { InsideStatusDecision } from '../../../core/constants/inside.status.decision.enum';
import ChangeInsideStatusParams from '../../../core/params/change.inside.status.params';
import TaskAssignmentApiService from '../../api/task.assignment.api-service';
import TaskAssignmentRepository from '../task.assignment.repository';

describe('TaskAssignmentRepository', () => {
  it('returns the same singleton instance', () => {
    expect(TaskAssignmentRepository.getInstance()).toBe(TaskAssignmentRepository.getInstance());
  });

  it('parses task assignment responses', async () => {
    const repository = TaskAssignmentRepository.getInstance();
    const apiService = TaskAssignmentApiService.getInstance();

    vi.spyOn(apiService, 'assignProjectDepartmentItemTask').mockResolvedValue({
      data: { status: true, message: 'Task assigned' },
      statusCode: 200,
    });
    vi.spyOn(apiService, 'fetchEmployeeTasks').mockResolvedValue({
      data: {
        status: true,
        message: 'Tasks fetched',
        data: {
          data: [
            {
              id: 7,
              task_name: 'Design review',
              employees: [{ id: 16, name: 'Mohamed Saad' }],
            },
          ],
          meta: { current_page: 1, last_page: 1, total: 1, per_page: 10 },
        },
      },
      statusCode: 200,
    });
    vi.spyOn(apiService, 'changeEmployeeTaskStatus').mockResolvedValue({
      data: { status: true, message: 'Task status changed' },
      statusCode: 200,
    });
    vi.spyOn(apiService, 'changeInsideStatus').mockResolvedValue({
      data: { status: true, message: 'Inside status changed' },
      statusCode: 200,
    });

    const assigned = await repository.assignProjectDepartmentItemTask({
      project_department_item_id: 39,
      employee_ids: [16],
      notes: '',
    });
    const tasks = await repository.fetchEmployeeTasks({ page: 1 });
    const taskStatus = await repository.changeEmployeeTaskStatus('update_employee_task_status', {
      task_id: 7,
      status: 'done',
    });
    const insideStatus = await repository.changeInsideStatus(
      new ChangeInsideStatusParams({
        projectDepartmentItemId: 39,
        status: InsideStatusDecision.ACCEPT,
      }),
    );

    expect(assigned).toBeInstanceOf(DataSuccess);
    expect(tasks).toBeInstanceOf(DataSuccess);
    expect(tasks.data?.[0]).toBeInstanceOf(TaskAssignmentEmployeeTaskModel);
    expect(tasks.data?.[0].title).toBe('Design review');
    expect(tasks.pagination?.total).toBe(1);
    expect(taskStatus).toBeInstanceOf(DataSuccess);
    expect(insideStatus).toBeInstanceOf(DataSuccess);
  });

  it('returns DataFailed when the service reports a failed action', async () => {
    const repository = TaskAssignmentRepository.getInstance();
    const apiService = TaskAssignmentApiService.getInstance();

    vi.spyOn(apiService, 'assignProjectDepartmentItemTask').mockResolvedValue({
      data: { status: false, message: 'Cannot assign task' },
      statusCode: 400,
    });

    const result = await repository.assignProjectDepartmentItemTask({
      project_department_item_id: 39,
      employee_ids: [16],
      notes: '',
    });

    expect(result).toBeInstanceOf(DataFailed);
    expect(result.error?.displayMessage).toBe('Cannot assign task');
  });
});
