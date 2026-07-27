import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { useTaskAssignmentForm } from '../useTaskAssignmentForm';

const mocks = vi.hoisted(() => ({
  assignProjectDepartmentItemTask: vi.fn(),
  employeeFetchList: vi.fn(),
  projectItemFetchList: vi.fn(),
  toastSuccess: vi.fn(),
  toastWarning: vi.fn(),
  toastError: vi.fn(),
  employeeListState: { value: {} },
  projectItemListState: { value: {} },
}));

vi.mock('@/base/Presentation/Dialogs/dialog.manager', () => ({
  dialogManager: {
    toastSuccess: mocks.toastSuccess,
    toastWarning: mocks.toastWarning,
    toastError: mocks.toastError,
  },
}));

vi.mock('../../controllers/task.assignment.controller', () => ({
  default: {
    getInstance: () => ({
      assignProjectDepartmentItemTask: mocks.assignProjectDepartmentItemTask,
    }),
  },
}));

vi.mock('@/modules/MainOrganization/employee/presentation/controllers/employee.controller', () => ({
  default: {
    getInstance: () => ({
      listState: mocks.employeeListState,
      fetchList: mocks.employeeFetchList,
    }),
  },
}));

vi.mock(
  '@/modules/MainOrganization/ProjectItem/presentation/controllers/project.Item.controller',
  () => ({
    default: {
      getInstance: () => ({
        listState: mocks.projectItemListState,
        fetchList: mocks.projectItemFetchList,
      }),
    },
  }),
);

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

const mountComposable = () =>
  mount({
    setup() {
      return useTaskAssignmentForm();
    },
    template: '<div />',
  });

describe('useTaskAssignmentForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.employeeListState.value = new DataSuccess({
      data: [
        { id: 16, name: 'Mohamed Saad' },
        { id: 20, name: 'Sara Ali' },
      ],
    });
    mocks.projectItemListState.value = new DataSuccess({
      data: [
        {
          id: 39,
          item: { id: 5, title: 'Layout plan' },
          project_title: 'Project A',
        },
      ],
    });
    mocks.employeeFetchList.mockResolvedValue(new DataSuccess({ data: [] }));
    mocks.projectItemFetchList.mockResolvedValue(new DataSuccess({ data: [] }));
    mocks.assignProjectDepartmentItemTask.mockResolvedValue(
      new DataSuccess<void>({ message: 'Task assigned' }),
    );
  });

  it('loads only form dependencies and submits unique numeric employee ids', async () => {
    const wrapper = mountComposable();
    await flushPromises();

    const vm = wrapper.vm as unknown as ReturnType<typeof useTaskAssignmentForm>;

    expect(mocks.employeeFetchList).toHaveBeenCalledTimes(1);
    expect(mocks.projectItemFetchList).toHaveBeenCalledTimes(1);
    expect(vm.projectDepartmentItemOptions).toHaveLength(1);
    expect(vm.employeeOptions).toHaveLength(2);

    vm.updateSelectedProjectDepartmentItem({ id: 39, title: 'Layout plan' });
    vm.updateSelectedEmployees([
      { id: 16, title: 'Mohamed Saad' },
      { id: 20, title: 'Sara Ali' },
      { id: 16, title: 'Mohamed Saad' },
    ]);
    vm.assignmentForm.notes = 'Review design before delivery';
    await vm.addAttachmentsFromUpload([
      {
        id: 'upload-1',
        name: 'brief.jpg',
        type: 'image/jpeg',
        size: '12 KB',
        url: 'blob:brief',
        base64: 'data:image/jpeg;base64,abc123',
        file: new File(['image'], 'brief.jpg', {
          type: 'image/jpeg',
          lastModified: 100,
        }),
      },
      {
        id: 'upload-1-duplicate',
        name: 'brief.jpg',
        type: 'image/jpeg',
        size: '12 KB',
        url: 'blob:brief-copy',
        base64: 'data:image/jpeg;base64,abc123',
        file: new File(['image'], 'brief.jpg', {
          type: 'image/jpeg',
          lastModified: 100,
        }),
      },
    ]);
    vm.updateAttachmentAlt(0, 'Execution brief');
    vm.updateAttachmentLink(0, '');

    await expect(vm.submitTaskAssignment()).resolves.toBe(true);

    expect(mocks.assignProjectDepartmentItemTask.mock.calls[0][0].toMap()).toEqual({
      project_department_item_id: 39,
      employee_ids: [16, 20],
      notes: 'Review design before delivery',
      has_attached: true,
      attachments: [
        {
          file: 'data:image/jpeg;base64,abc123',
          alt: 'Execution brief',
          link: null,
        },
      ],
    });
    expect(mocks.toastSuccess).toHaveBeenCalledWith('Task assigned');
    expect(vm.assignmentForm.employee_ids).toEqual([]);
    expect(vm.assignmentForm.has_attached).toBe(false);
    expect(vm.assignmentForm.attachments).toEqual([]);
  });

  it('keeps attachment state synchronized when adding and removing files', async () => {
    const wrapper = mountComposable();
    await flushPromises();

    const vm = wrapper.vm as unknown as ReturnType<typeof useTaskAssignmentForm>;

    await vm.addAttachmentsFromUpload([
      {
        id: 'upload-1',
        name: 'brief.pdf',
        type: 'application/pdf',
        size: '24 KB',
        url: 'blob:brief',
        base64: 'data:application/pdf;base64,abc123',
      },
    ]);

    expect(vm.assignmentForm.has_attached).toBe(true);
    expect(vm.assignmentForm.attachments).toHaveLength(1);

    vm.removeAttachment(0);

    expect(vm.assignmentForm.has_attached).toBe(false);
    expect(vm.assignmentForm.attachments).toEqual([]);
  });

  it('does not submit or redirect when frontend validation fails', async () => {
    const wrapper = mountComposable();
    await flushPromises();

    const vm = wrapper.vm as unknown as ReturnType<typeof useTaskAssignmentForm>;

    await expect(vm.submitTaskAssignment()).resolves.toBe(false);

    expect(mocks.assignProjectDepartmentItemTask).not.toHaveBeenCalled();
    expect(mocks.toastWarning).toHaveBeenCalled();
  });
});
