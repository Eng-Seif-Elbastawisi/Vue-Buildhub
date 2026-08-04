import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import TaskAssignmentEmployeeTaskModel from '../../../core/models/task.assignment.employee-task.model';
import { InsideStatusDecision } from '../../../core/constants/inside.status.decision.enum';
import ChangeInsideStatusParams from '../../../core/params/change.inside.status.params';
import { useEmployeeTasks } from '../useEmployeeTasks';

const mocks = vi.hoisted(() => ({
  fetchEmployeeTasks: vi.fn(),
  changeEmployeeTaskStatus: vi.fn(),
  changeInsideStatus: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
  employeeTasksState: { value: {} },
}));

vi.mock('@/base/Presentation/Dialogs/dialog.manager', () => ({
  dialogManager: {
    toastSuccess: mocks.toastSuccess,
    toastError: mocks.toastError,
  },
}));

vi.mock('../../controllers/task.assignment.controller', () => ({
  default: {
    getInstance: () => ({
      employeeTasksState: mocks.employeeTasksState,
      fetchEmployeeTasks: mocks.fetchEmployeeTasks,
      changeEmployeeTaskStatus: mocks.changeEmployeeTaskStatus,
      changeInsideStatus: mocks.changeInsideStatus,
    }),
  },
}));

vi.mock('vue-i18n', () => ({
  createI18n: () => ({
    global: {
      t: (key: string) => key,
    },
  }),
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router');

  return {
    ...actual,
    useRoute: () => ({
      query: { status: '4' },
    }),
  };
});

const task = TaskAssignmentEmployeeTaskModel.fromJson({
  id: 7,
  task_name: 'Design review',
  project_department_item: { id: 39, title: 'Layout plan' },
  status: 'pending',
  available_statuses: [{ id: 'done', title: 'Done' }],
  status_update_action: 'update_employee_task_status',
});

const mountComposable = () =>
  mount({
    setup() {
      return useEmployeeTasks();
    },
    template: '<div />',
  });

describe('useEmployeeTasks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.employeeTasksState.value = new DataSuccess<TaskAssignmentEmployeeTaskModel[]>({
      data: [task],
    });
    mocks.fetchEmployeeTasks.mockResolvedValue(
      new DataSuccess<TaskAssignmentEmployeeTaskModel[]>({ data: [task] }),
    );
    mocks.changeEmployeeTaskStatus.mockResolvedValue(
      new DataSuccess<void>({ message: 'Task status changed' }),
    );
    mocks.changeInsideStatus.mockResolvedValue(
      new DataSuccess<void>({ message: 'Inside status changed' }),
    );
  });

  it('loads only employee tasks on mount', async () => {
    const wrapper = mountComposable();
    await flushPromises();

    const vm = wrapper.vm as unknown as ReturnType<typeof useEmployeeTasks>;

    expect(mocks.fetchEmployeeTasks).toHaveBeenCalledTimes(1);
    expect(vm.tasksCount).toBe(1);
    expect(vm.taskRows(vm.tasksState.data)).toEqual([task]);
  });

  it('sends task status updates through the backend-provided action', async () => {
    const wrapper = mountComposable();
    await flushPromises();

    const vm = wrapper.vm as unknown as ReturnType<typeof useEmployeeTasks>;

    await vm.changeTaskStatus(task, 'done');

    expect(mocks.changeEmployeeTaskStatus).toHaveBeenCalledWith('update_employee_task_status', {
      task_id: 7,
      status: 'done',
    });
    expect(mocks.toastSuccess).toHaveBeenCalledWith('Task status changed');
    expect(mocks.fetchEmployeeTasks).toHaveBeenCalledTimes(2);
  });

  it('sends the project department item id with the selected review decision', async () => {
    const wrapper = mountComposable();
    await flushPromises();

    const vm = wrapper.vm as unknown as ReturnType<typeof useEmployeeTasks>;

    await vm.changeInsideStatus(task, InsideStatusDecision.REJECT);

    const params = mocks.changeInsideStatus.mock.calls[0]?.[0] as ChangeInsideStatusParams;
    expect(params).toBeInstanceOf(ChangeInsideStatusParams);
    expect(params.toMap()).toEqual({
      project_department_item_id: 39,
      status: 6,
    });
    expect(mocks.toastSuccess).toHaveBeenCalledWith('Inside status changed');
    expect(mocks.fetchEmployeeTasks).toHaveBeenCalledTimes(2);
  });
});
