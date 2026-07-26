import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import TaskAssignmentForm from '../TaskAssignmentForm.vue';

const mountForm = (props: Record<string, unknown> = {}) =>
  mount(TaskAssignmentForm, {
    props: {
      selectedProjectDepartmentItem: null,
      selectedEmployees: [],
      projectDepartmentItemOptions: [{ id: 39, title: 'Layout plan' }],
      employeeOptions: [{ id: 16, title: 'Mohamed Saad' }],
      projectDepartmentItemsLoading: false,
      employeesLoading: false,
      assignmentSubmitting: false,
      attachmentsProcessing: false,
      attachmentsUploadKey: 0,
      assignmentValidationErrors: {},
      assignmentGeneralError: '',
      notes: '',
      attachments: [],
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
        AppButton: {
          name: 'AppButton',
          props: ['type', 'loading', 'disabled'],
          template:
            '<button :type="type || \'button\'" :disabled="disabled || loading"><slot /></button>',
        },
        HandleFilesUpload: {
          name: 'HandleFilesUpload',
          emits: ['change'],
          template:
            "<button class=\"upload-stub\" type=\"button\" @click=\"$emit('change', [{ id: '1', name: 'brief.jpg', type: 'image/jpeg', size: '12 KB', url: 'blob:brief', base64: 'data:image/jpeg;base64,abc123' }])\"></button>",
        },
      },
    },
  });

describe('TaskAssignmentForm', () => {
  it('emits selected values, notes, attachments, and submit events', async () => {
    const wrapper = mountForm();
    const selects = wrapper.findAllComponents({ name: 'UpdatedCustomInputSelect' });

    selects[0].vm.$emit('update:modelValue', { id: 39, title: 'Layout plan' });
    selects[1].vm.$emit('update:modelValue', [{ id: 16, title: 'Mohamed Saad' }]);
    await wrapper.find('textarea').setValue('Review design before delivery');
    await wrapper.find('.upload-stub').trigger('click');
    await wrapper.find('form').trigger('submit.prevent');

    expect(wrapper.emitted('update-project-department-item')?.[0][0]).toEqual({
      id: 39,
      title: 'Layout plan',
    });
    expect(wrapper.emitted('update-employees')?.[0][0]).toEqual([
      { id: 16, title: 'Mohamed Saad' },
    ]);
    expect(wrapper.emitted('update-notes')?.[0][0]).toBe('Review design before delivery');
    expect(wrapper.emitted('add-attachments')?.[0][0]).toEqual([
      {
        id: '1',
        name: 'brief.jpg',
        type: 'image/jpeg',
        size: '12 KB',
        url: 'blob:brief',
        base64: 'data:image/jpeg;base64,abc123',
      },
    ]);
    expect(wrapper.emitted('submit')).toHaveLength(1);
  });

  it('renders attachment metadata fields and nested validation errors', async () => {
    const wrapper = mountForm({
      attachments: [
        {
          file: 'data:image/jpeg;base64,abc123',
          alt: 'Execution brief',
          link: null,
          name: 'brief.jpg',
          type: 'image/jpeg',
          size: '12 KB',
          signature: 'brief.jpg|12000|image/jpeg|1',
        },
      ],
      assignmentValidationErrors: {
        'attachments.0.file': 'File is required',
        'attachments.0.alt': 'Alt is required',
        'attachments.0.link': 'Invalid URL',
      },
    });

    const inputs = wrapper.findAll('.task-assignment-form__input');

    await inputs[0].setValue('Updated alt');
    await inputs[1].setValue('https://example.com/brief');
    await wrapper.find('.task-assignment-attachment__remove').trigger('click');

    expect(wrapper.text()).toContain('brief.jpg');
    expect(wrapper.text()).toContain('File is required');
    expect(wrapper.text()).toContain('Alt is required');
    expect(wrapper.text()).toContain('Invalid URL');
    expect(wrapper.emitted('update-attachment-alt')?.[0]).toEqual([0, 'Updated alt']);
    expect(wrapper.emitted('update-attachment-link')?.[0]).toEqual([
      0,
      'https://example.com/brief',
    ]);
    expect(wrapper.emitted('remove-attachment')?.[0]).toEqual([0]);
  });
});
