import { describe, expect, it, vi } from 'vitest';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
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
});
