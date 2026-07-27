import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import TaskAssignmentEmployeeTaskModel from '../../../core/models/task.assignment.employee-task.model';
import TaskStatusAction from '../TaskStatusAction.vue';

const task = TaskAssignmentEmployeeTaskModel.fromJson({
  id: 7,
  status: 'pending',
  available_statuses: [{ id: 'done', title: 'Done' }],
  status_update_action: 'update_employee_task_status',
});

describe('TaskStatusAction', () => {
  it('emits the selected status for backend-provided actions', async () => {
    const wrapper = mount(TaskStatusAction, {
      props: {
        task,
        disabled: false,
      },
      global: {
        mocks: {
          $t: (key: string) => key,
        },
      },
    });

    await wrapper.find('select').setValue('done');

    expect(wrapper.emitted('change-status')?.[0]).toEqual([task, 'done']);
  });

  it('renders readonly text when no status action is available', () => {
    const wrapper = mount(TaskStatusAction, {
      props: {
        task: TaskAssignmentEmployeeTaskModel.fromJson({ id: 8, task_name: 'Readonly task' }),
        disabled: false,
      },
      global: {
        mocks: {
          $t: (key: string) => key,
        },
      },
    });

    expect(wrapper.find('.task-status-action__readonly').exists()).toBe(true);
  });
});
