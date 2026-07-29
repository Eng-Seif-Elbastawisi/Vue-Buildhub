import { describe, expect, it, vi } from 'vitest';
import {
  DataLoading,
  DataSuccess,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import FetchApprovedTasksParams from '../../../core/params/fetch.approved.tasks.params';
import TaskAssignmentApprovedTaskModel from '../../../core/models/task.assignment.approved-task.model';
import TaskAssignmentEmployeeTaskModel from '../../../core/models/task.assignment.employee-task.model';
import TaskAssignmentRepository from '../../../data/repositories/task.assignment.repository';
import TaskAssignmentController from '../task.assignment.controller';

vi.mock('@/base/Presentation/Dialogs/dialog.manager', () => ({
  dialogManager: {
    toastError: vi.fn(),
  },
}));

describe('TaskAssignmentController', () => {
  it('returns the same singleton instance', () => {
    expect(TaskAssignmentController.getInstance()).toBe(TaskAssignmentController.getInstance());
  });

  it('stores employee task data and forwards assignment/status actions', async () => {
    const repository = TaskAssignmentRepository.getInstance();
    const controller = TaskAssignmentController.getInstance();
    const task = TaskAssignmentEmployeeTaskModel.fromJson({ id: 7, task_name: 'Design review' });

    vi.spyOn(repository, 'fetchEmployeeTasks').mockResolvedValue(
      new DataSuccess<TaskAssignmentEmployeeTaskModel[]>({ data: [task] }),
    );
    vi.spyOn(repository, 'assignProjectDepartmentItemTask').mockResolvedValue(
      new DataSuccess<void>({ message: 'Task assigned' }),
    );
    vi.spyOn(repository, 'changeEmployeeTaskStatus').mockResolvedValue(
      new DataSuccess<void>({ message: 'Task status changed' }),
    );

    const tasks = await controller.fetchEmployeeTasks({ page: 1 });
    const assigned = await controller.assignProjectDepartmentItemTask({
      project_department_item_id: 39,
      employee_ids: [16],
      notes: '',
    });
    const status = await controller.changeEmployeeTaskStatus('update_employee_task_status', {
      task_id: 7,
      status: 'done',
    });

    expect(tasks).toBeInstanceOf(DataSuccess);
    expect(controller.employeeTasksState.value).toBeInstanceOf(DataSuccess);
    expect(controller.employeeTasksState.value.data?.[0].title).toBe('Design review');
    expect(assigned).toBeInstanceOf(DataSuccess);
    expect(status).toBeInstanceOf(DataSuccess);
  });

  it('publishes approved-task loading and response state', async () => {
    const repository = TaskAssignmentRepository.getInstance();
    const controller = TaskAssignmentController.getInstance();
    const approvedTask = TaskAssignmentApprovedTaskModel.fromJson({
      id: 39,
      is_assign: false,
    });
    const approvedTasks = new DataSuccess<TaskAssignmentApprovedTaskModel[]>({
      data: [approvedTask],
    });
    let resolveApprovedTasks:
      | ((approvedTasksState: DataSuccess<TaskAssignmentApprovedTaskModel[]>) => void)
      | undefined;
    const approvedTasksRequest = new Promise<DataSuccess<TaskAssignmentApprovedTaskModel[]>>(
      (resolve) => {
        resolveApprovedTasks = resolve;
      },
    );

    vi.spyOn(repository, 'fetchApprovedTasks').mockReturnValue(approvedTasksRequest);

    const pendingFetch = controller.fetchApprovedTasks(new FetchApprovedTasksParams());

    expect(controller.approvedTasksState.value).toBeInstanceOf(DataLoading);

    if (!resolveApprovedTasks) {
      throw new Error('Approved-tasks request resolver was not initialized.');
    }

    resolveApprovedTasks(approvedTasks);

    await expect(pendingFetch).resolves.toBe(approvedTasks);
    expect(controller.approvedTasksState.value).toBeInstanceOf(DataSuccess);
    expect(controller.approvedTasksState.value.data).toEqual([approvedTask]);
  });
});
