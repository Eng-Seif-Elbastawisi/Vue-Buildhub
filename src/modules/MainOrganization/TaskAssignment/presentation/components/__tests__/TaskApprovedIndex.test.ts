import { flushPromises, mount } from '@vue/test-utils';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import type * as VueRouterModule from 'vue-router';

import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';

import AssignProjectDepartmentItemTaskParams from '../../../core/params/assign.project.department.item.task.params';
import type FetchApprovedTasksParams from '../../../core/params/fetch.approved.tasks.params';
import TaskAssignmentApprovedTaskModel from '../../../core/models/task.assignment.approved-task.model';
import TaskApprovedIndex from '../TaskApprovedIndex.vue';

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  route: {
    query: {
      page: '2',
    },
  },
  fetchApprovedTasks: vi.fn(),
  assignTask: vi.fn(),
}));

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof VueRouterModule>();

  return {
    ...actual,
    useRoute: () => mocks.route,
    useRouter: () => ({
      push: mocks.push,
    }),
  };
});

vi.mock('../../controllers/task.assignment.controller', () => ({
  default: {
    getInstance: () => ({
      fetchApprovedTasks: mocks.fetchApprovedTasks,
      assignTask: mocks.assignTask,
      pagination: {
        value: null,
      },
    }),
  },
}));

const unassignedTask = TaskAssignmentApprovedTaskModel.fromJson({
  id: 39,
  uuid: 'approved-39',
  project: { id: 7, title: 'Project A' },
  department: { id: 8, title: 'Design' },
  department_item: { id: 9, title: 'Layout plan' },
  quantity: 2,
  price: 1500,
  final_price: 3000,
  is_assign: false,
});

const assignedTask = TaskAssignmentApprovedTaskModel.fromJson({
  id: 40,
  uuid: 'approved-40',
  project: { id: 10, title: 'Project B' },
  department: { id: 11, title: 'Execution' },
  item: { id: 12, title: 'Site work' },
  quantity: 1,
  price: 500,
  final_price: 500,
  is_assign: true,
});

const validAssignmentParams = (projectDepartmentItemId: number) =>
  new AssignProjectDepartmentItemTaskParams({
    project_department_item_id: projectDepartmentItemId,
    employee_ids: [16],
    employee_review_id: 20,
    duration_type: 1,
    duration: 5,
    notes: '',
    has_attached: false,
    attachments: [],
  });

const AppTableStub = {
  name: 'AppTable',
  props: ['headers', 'items'],
  template: `
    <div class="app-table-stub">
      <div v-for="item in items" :key="item.id" class="approved-row">
        <slot name="cell-isAssign" :item="item" />
        <slot name="actions" :item="item" />
      </div>
    </div>
  `,
};

const DialogStub = {
  name: 'Dialog',
  props: ['visible'],
  emits: ['hide', 'update:visible'],
  template: `
    <section v-if="visible" class="dialog-stub">
      <slot name="header" />
      <slot />
      <slot name="footer" />
    </section>
  `,
};

const TaskAssignmentFormStub = {
  name: 'TaskAssignmentForm',
  props: ['projectDepartmentItemId', 'loading'],
  emits: ['updateData'],
  setup(
    props: { projectDepartmentItemId: number },
    {
      emit,
    }: { emit: (event: 'updateData', params: AssignProjectDepartmentItemTaskParams) => void },
  ) {
    const emitParams = (): void => {
      emit('updateData', validAssignmentParams(props.projectDepartmentItemId));
    };

    return {
      emitParams,
    };
  },
  template:
    '<button class="form-stub" type="button" :data-project-department-item-id="projectDepartmentItemId" @click="emitParams" />',
};

const mountIndex = async () => {
  const wrapper = mount(TaskApprovedIndex, {
    global: {
      mocks: {
        $t: (key: string) => key,
      },
      stubs: {
        AppTable: AppTableStub,
        Dialog: DialogStub,
        Pagination: true,
        TableSkelaton: true,
        TaskAssignmentForm: TaskAssignmentFormStub,
      },
    },
  });

  await flushPromises();

  return wrapper;
};

describe('TaskApprovedIndex', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.fetchApprovedTasks.mockResolvedValue(
      new DataSuccess<TaskAssignmentApprovedTaskModel[]>({
        data: [unassignedTask, assignedTask],
      }),
    );
    mocks.assignTask.mockResolvedValue(new DataSuccess<void>({ message: 'Task assigned' }));
  });

  it('opens the assignment dialog from an unassigned approved-task row', async () => {
    const wrapper = await mountIndex();

    const assignButtons = wrapper.findAll('.task-assignment-action-btn');

    expect(assignButtons).toHaveLength(1);

    await assignButtons[0]?.trigger('click');

    expect(wrapper.find('.dialog-stub').exists()).toBe(true);
    expect(wrapper.text()).toContain('Project A');
    expect(wrapper.text()).toContain('Design');
    expect(wrapper.text()).toContain('Layout plan');
    expect(wrapper.find('.form-stub').attributes('data-project-department-item-id')).toBe('39');
  });

  it('validates, submits assignment params, closes the dialog, and refreshes the current page', async () => {
    const wrapper = await mountIndex();

    await wrapper.get('.task-assignment-action-btn').trigger('click');
    await wrapper.get('.form-stub').trigger('click');
    await wrapper.get('.assignment-dialog__actions .btn-primary').trigger('click');
    await flushPromises();

    expect(mocks.assignTask).toHaveBeenCalledTimes(1);

    const submittedParams = mocks.assignTask.mock
      .calls[0]?.[0] as AssignProjectDepartmentItemTaskParams;

    expect(submittedParams).toBeInstanceOf(AssignProjectDepartmentItemTaskParams);
    expect(submittedParams.toMap().project_department_item_id).toBe(39);
    expect(wrapper.find('.dialog-stub').exists()).toBe(false);
    expect(mocks.fetchApprovedTasks).toHaveBeenCalledTimes(2);

    const refreshParams = mocks.fetchApprovedTasks.mock.calls[1]?.[0] as FetchApprovedTasksParams;

    expect(refreshParams.toMap()).toMatchObject({
      page: 2,
      per_page: 10,
      with_pagination: 1,
      is_assign: 0,
    });
  });
});
