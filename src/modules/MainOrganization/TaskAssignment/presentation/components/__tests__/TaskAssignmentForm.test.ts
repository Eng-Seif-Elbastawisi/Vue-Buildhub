import { mount, type VueWrapper } from '@vue/test-utils';
import { nextTick } from 'vue';
import { describe, expect, it, vi } from 'vitest';
import type * as VueI18nModule from 'vue-i18n';

import AssignProjectDepartmentItemTaskParams from '../../../core/params/assign.project.department.item.task.params';
import TaskAssignmentForm from '../TaskAssignmentForm.vue';

vi.mock('vue-i18n', async (importOriginal) => {
  const actual = await importOriginal<typeof VueI18nModule>();

  return {
    ...actual,
    useI18n: () => ({
      t: (key: string) => key,
    }),
  };
});

const mountForm = (props: Record<string, unknown> = {}) =>
  mount(TaskAssignmentForm, {
    props: {
      projectDepartmentItemId: 39,
      loading: false,
      ...props,
    },
    global: {
      mocks: {
        $t: (key: string) => key,
      },
      stubs: {
        UpdatedCustomInputSelect: {
          name: 'UpdatedCustomInputSelect',
          props: ['id', 'modelValue'],
          emits: ['update:modelValue'],
          template: '<div class="select-stub" :data-id="id"></div>',
        },
        HandleFilesUpload: {
          name: 'HandleFilesUpload',
          emits: ['change'],
          template:
            "<button class=\"upload-stub\" type=\"button\" @click=\"$emit('change', [{ name: 'brief.jpg', type: 'image/jpeg', size: '12 KB', base64: 'data:image/jpeg;base64,abc123', alt: 'Brief image', link: 'https://example.com/brief' }])\"></button>",
        },
      },
    },
  });

const latestParams = (wrapper: VueWrapper): AssignProjectDepartmentItemTaskParams => {
  return wrapper.emitted('updateData')?.at(-1)?.[0] as AssignProjectDepartmentItemTaskParams;
};

describe('TaskAssignmentForm', () => {
  it('emits params with the selected row id and TitleInterface ids', async () => {
    const wrapper = mountForm();
    const selects = wrapper.findAllComponents({ name: 'UpdatedCustomInputSelect' });

    expect(selects.map((select) => select.props('id'))).toEqual([
      'employee_ids',
      'employee_review_id',
      'duration_type',
    ]);
    expect(wrapper.find('[data-id="project_department_item_id"]').exists()).toBe(false);

    selects[0]?.vm.$emit('update:modelValue', [{ id: 16, title: 'Mohamed Saad' }]);
    selects[1]?.vm.$emit('update:modelValue', { id: 20, title: 'Mona Reviewer' });
    selects[2]?.vm.$emit('update:modelValue', { id: 1, title: 'Day' });

    await wrapper.find('#duration').setValue(5);
    await wrapper.find('#has_attached').setValue(true);
    await wrapper.find('#task_assignment_notes').setValue('  Review design before delivery  ');
    await wrapper.find('.upload-stub').trigger('click');
    await nextTick();

    const params = latestParams(wrapper);

    expect(params).toBeInstanceOf(AssignProjectDepartmentItemTaskParams);
    expect(params.toMap()).toEqual({
      project_department_item_id: 39,
      employee_ids: [16],
      employee_review_id: 20,
      duration_type: 1,
      duration: 5,
      notes: 'Review design before delivery',
      has_attached: true,
      attachments: [
        {
          file: 'data:image/jpeg;base64,abc123',
          alt: 'Brief image',
          link: 'https://example.com/brief',
        },
      ],
    });
  });

  it('re-emits params when the parent changes the selected row id', async () => {
    const wrapper = mountForm();

    expect(latestParams(wrapper).project_department_item_id).toBe(39);

    await wrapper.setProps({
      projectDepartmentItemId: 42,
    });
    await nextTick();

    expect(latestParams(wrapper).project_department_item_id).toBe(42);
  });

  it('renders uploaded attachment metadata and removes attachments locally', async () => {
    const wrapper = mountForm();

    await wrapper.find('.upload-stub').trigger('click');
    await nextTick();

    expect(wrapper.text()).toContain('brief.jpg');

    await wrapper.find('#attachment_alt_0').setValue('Updated alt');
    await wrapper.find('#attachment_link_0').setValue('https://example.com/updated-brief');
    await wrapper.find('.task-assignment-attachment__remove').trigger('click');
    await nextTick();

    expect(wrapper.find('.task-assignment-attachment').exists()).toBe(false);
    expect(latestParams(wrapper).attachments).toEqual([]);
  });
});
