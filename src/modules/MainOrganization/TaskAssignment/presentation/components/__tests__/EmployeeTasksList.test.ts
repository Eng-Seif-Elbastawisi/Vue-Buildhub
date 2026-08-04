import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { InsideStatusDecision } from '../../../core/constants/inside.status.decision.enum';
import TaskAssignmentEmployeeTaskModel from '../../../core/models/task.assignment.employee-task.model';
import EmployeeTasksList from '../EmployeeTasksList.vue';

const task = TaskAssignmentEmployeeTaskModel.fromJson({
  id: 7,
  task_name: 'Design review',
  project_name: 'Project A',
  project_department_item: { id: 39, title: 'Layout plan' },
  employees: [{ id: 16, name: 'Mohamed Saad' }],
  status: 'pending',
  status_label: 'Pending',
  available_statuses: [{ id: 'done', title: 'Done' }],
  status_update_action: 'update_employee_task_status',
});

const mountTaskList = () =>
  mount(EmployeeTasksList, {
    props: {
      tasksState: new DataSuccess<TaskAssignmentEmployeeTaskModel[]>({ data: [task] }),
      tasksLoading: false,
      tasksPagination: null,
      statusUpdateErrors: {},
      taskRows: (data: unknown) =>
        Array.isArray(data) ? (data as TaskAssignmentEmployeeTaskModel[]) : [],
      formatDate: (value?: string | null) => value || '-',
      valueOrEmpty: (value?: string | number | null) => String(value || '-'),
      isTaskUpdating: () => false,
      isInsideStatusUpdating: () => false,
      getStatusDisplay: () => 'Pending',
      getStatusClass: () => 'is-progress',
    },
    global: {
      mocks: {
        $t: (key: string) => key,
      },
      stubs: {
        DataStatusBuilder: {
          props: ['controller'],
          template: '<div><slot name="success" :data="controller.data" /></div>',
        },
        Pagination: {
          template: '<div class="pagination-stub"></div>',
        },
      },
    },
  });

describe('EmployeeTasksList', () => {
  it('renders task rows and forwards status changes', async () => {
    const wrapper = mountTaskList();

    expect(wrapper.text()).toContain('Design review');

    await wrapper.find('select').setValue('done');
    expect(wrapper.emitted('change-status')?.[0]).toEqual([task, 'done']);
  });

  it.each([
    ['accept', 'task_assignment.accept', InsideStatusDecision.ACCEPT],
    ['reject', 'task_assignment.reject', InsideStatusDecision.REJECT],
  ] as const)('forwards the %s review decision', async (_, label, status) => {
    const wrapper = mountTaskList();
    const decisionButton = wrapper.findAll('button').find((button) => button.text() === label);

    expect(decisionButton).toBeDefined();
    await decisionButton?.trigger('click');

    expect(wrapper.emitted('change-inside-status')?.[0]).toEqual([task, status]);
  });

  it('forwards retry refresh requests', async () => {
    const retry = vi.fn();
    const wrapper = mount(EmployeeTasksList, {
      props: {
        tasksState: new DataSuccess<TaskAssignmentEmployeeTaskModel[]>({ data: [] }),
        tasksLoading: false,
        tasksPagination: null,
        statusUpdateErrors: {},
        taskRows: () => [],
        formatDate: () => '-',
        valueOrEmpty: () => '-',
        isTaskUpdating: () => false,
        isInsideStatusUpdating: () => false,
        getStatusDisplay: () => 'Pending',
        getStatusClass: () => 'is-progress',
      },
      global: {
        mocks: {
          $t: (key: string) => key,
        },
        stubs: {
          DataStatusBuilder: {
            props: ['onRetry'],
            template: '<button class="retry-stub" @click="onRetry()">retry</button>',
          },
          Pagination: true,
          TaskStatusAction: true,
        },
      },
      attrs: {
        onRefresh: retry,
      },
    });

    await wrapper.find('.retry-stub').trigger('click');
    expect(retry).toHaveBeenCalledTimes(1);
  });
});
