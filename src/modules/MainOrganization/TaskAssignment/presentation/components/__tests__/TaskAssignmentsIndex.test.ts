import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import TaskAssignmentsIndex from '../TaskAssignmentsIndex.vue';

const mocks = vi.hoisted(() => ({
  fetchEmployeeTasks: vi.fn(),
  changeTaskStatus: vi.fn(),
  onPerPageChange: vi.fn(),
}));

vi.mock('../../composables/useEmployeeTasks', () => ({
  useEmployeeTasks: () => ({
    tasksState: { data: [] },
    tasksLoading: false,
    tasksCount: 3,
    tasksPagination: null,
    statusUpdateErrors: {},
    valueOrEmpty: (value?: string | number | null) => String(value || '-'),
    formatDate: (value?: string | null) => value || '-',
    taskRows: () => [],
    fetchEmployeeTasks: mocks.fetchEmployeeTasks,
    changeTaskStatus: mocks.changeTaskStatus,
    isTaskUpdating: () => false,
    getStatusDisplay: () => 'Pending',
    getStatusClass: () => 'is-progress',
    onPerPageChange: mocks.onPerPageChange,
  }),
}));

const RouterLinkStub = {
  name: 'RouterLink',
  props: ['to'],
  template: '<a class="router-link-stub"><slot /></a>',
};

describe('TaskAssignmentsIndex', () => {
  it('renders only the task assignments list page with refresh and add actions', async () => {
    const wrapper = mount(TaskAssignmentsIndex, {
      global: {
        mocks: {
          $t: (key: string) => key,
        },
        stubs: {
          RouterLink: RouterLinkStub,
          EmployeeTasksList: {
            emits: ['refresh'],
            template: '<section class="tasks-stub" @click="$emit(\'refresh\')" />',
          },
        },
      },
    });

    expect(wrapper.find('.task-assignments-index').exists()).toBe(true);
    expect(wrapper.find('.tasks-stub').exists()).toBe(true);
    expect(wrapper.find('.task-assignment-form').exists()).toBe(false);
    expect(wrapper.text()).toContain('task_assignment.title');
    expect(wrapper.text()).toContain('3 task_assignment.tasks_count');

    expect(wrapper.findComponent({ name: 'RouterLink' }).props('to')).toEqual({
      name: 'mainorganization-task-assignment-create',
    });

    await wrapper.find('.task-assignment-page-header__refresh').trigger('click');
    expect(mocks.fetchEmployeeTasks).toHaveBeenCalledTimes(1);
  });
});
