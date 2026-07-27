import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TaskAssignmentCreate from '../TaskAssignmentCreate.vue';

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  submitTaskAssignment: vi.fn(),
  updateSelectedProjectDepartmentItem: vi.fn(),
  updateSelectedEmployees: vi.fn(),
  addAttachmentsFromUpload: vi.fn(),
  removeAttachment: vi.fn(),
  updateAttachmentAlt: vi.fn(),
  updateAttachmentLink: vi.fn(),
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mocks.push,
  }),
}));

vi.mock('../../composables/useTaskAssignmentForm', () => ({
  useTaskAssignmentForm: () => ({
    assignmentForm: { notes: '', attachments: [] },
    assignmentSubmitting: false,
    attachmentsProcessing: false,
    attachmentsUploadKey: 0,
    assignmentGeneralError: '',
    assignmentValidationErrors: {},
    selectedProjectDepartmentItem: null,
    selectedEmployees: [],
    projectDepartmentItemOptions: [{ id: 39, title: 'Layout plan' }],
    employeeOptions: [{ id: 16, title: 'Mohamed Saad' }],
    employeesLoading: false,
    projectDepartmentItemsLoading: false,
    submitTaskAssignment: mocks.submitTaskAssignment,
    updateSelectedProjectDepartmentItem: mocks.updateSelectedProjectDepartmentItem,
    updateSelectedEmployees: mocks.updateSelectedEmployees,
    addAttachmentsFromUpload: mocks.addAttachmentsFromUpload,
    removeAttachment: mocks.removeAttachment,
    updateAttachmentAlt: mocks.updateAttachmentAlt,
    updateAttachmentLink: mocks.updateAttachmentLink,
  }),
}));

const RouterLinkStub = {
  name: 'RouterLink',
  props: ['to'],
  template: '<a class="router-link-stub"><slot /></a>',
};

const mountCreate = () =>
  mount(TaskAssignmentCreate, {
    global: {
      mocks: {
        $t: (key: string) => key,
      },
      stubs: {
        RouterLink: RouterLinkStub,
        TaskAssignmentForm: {
          emits: ['submit'],
          template: '<form class="form-stub" @submit.prevent="$emit(\'submit\')" />',
        },
      },
    },
  });

describe('TaskAssignmentCreate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.submitTaskAssignment.mockResolvedValue(true);
  });

  it('renders only the create form with a stable back link', () => {
    const wrapper = mountCreate();

    expect(wrapper.find('.task-assignment-create').exists()).toBe(true);
    expect(wrapper.find('.form-stub').exists()).toBe(true);
    expect(wrapper.find('.employee-tasks-list').exists()).toBe(false);
    expect(wrapper.text()).toContain('task_assignment.create_title');
    expect(wrapper.findComponent({ name: 'RouterLink' }).props('to')).toEqual({
      name: 'mainorganization-task-assignment-index',
    });
  });

  it('redirects to the list route only after successful submission', async () => {
    const wrapper = mountCreate();

    await wrapper.find('.form-stub').trigger('submit.prevent');

    expect(mocks.submitTaskAssignment).toHaveBeenCalledTimes(1);
    expect(mocks.push).toHaveBeenCalledWith({
      name: 'mainorganization-task-assignment-index',
    });
  });

  it('stays on the create page when submission fails', async () => {
    mocks.submitTaskAssignment.mockResolvedValue(false);
    const wrapper = mountCreate();

    await wrapper.find('.form-stub').trigger('submit.prevent');

    expect(mocks.submitTaskAssignment).toHaveBeenCalledTimes(1);
    expect(mocks.push).not.toHaveBeenCalled();
  });
});
