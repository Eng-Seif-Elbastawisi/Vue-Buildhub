import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import ProjectPreviewForm from '../ProjectPreviewForm.vue';
import type AddProjectPreviewParams from '../../../../core/params/add.project.preview.params';
import ProjectPreviewShowModel from '../../../../core/models/project.preview.show.model';
import { NotificationType } from '../../../../core/constants/notificationType.enum';
import { Status } from '../../../../core/constants/status.enum';

vi.mock('@/modules/MainOrganization/employee/presentation/controllers/employee.controller', () => ({
  default: {
    getInstance: vi.fn(() => ({ fetchAsOptions: vi.fn() })),
  },
}));

const DatePickerStub = {
  name: 'DatePicker',
  props: {
    modelValue: {
      type: [Date, String],
      default: null,
    },
    inputId: {
      type: String,
      required: true,
    },
    timeOnly: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue'],
  methods: {
    formatValue(value?: Date | string | null): string {
      if (!value) return '';
      if (typeof value === 'string') return value;

      const pad = (part: number) => String(part).padStart(2, '0');

      if (this.timeOnly) {
        return `${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}`;
      }

      return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
    },
  },
  template:
    '<input :id="inputId" :value="formatValue(modelValue)" @input="$emit(\'update:modelValue\', $event.target.value)" />',
};

describe('ProjectPreviewForm.vue', () => {
  it('hydrates edit values and emits preview params', () => {
    const projectPreview = new ProjectPreviewShowModel({
      id: 12,
      project_id: 10,
      engineer: { id: 15, title: 'Site Engineer' },
      pricing_responsible: { id: 18, title: 'Pricing Lead' },
      preview_date: '2026-06-25T00:00:00.000Z',
      preview_time: '10:30:00',
      site_link: 'https://maps.google.com/?q=30.0444,31.2357',
      address: 'Nasr City, Cairo, Egypt',
      status: Status.READY_FOR_PRICING,
      notification_type: NotificationType.URGENT,
      notification_message: 'Preview is ready for pricing',
    });

    const wrapper = mount(ProjectPreviewForm, {
      props: {
        projectPreview,
        isEdit: true,
      },
      global: {
        mocks: {
          $t: (key: string) => key,
        },
        stubs: {
          DatePicker: DatePickerStub,
          UpdatedCustomInputSelect: {
            name: 'UpdatedCustomInputSelect',
            props: ['id', 'modelValue', 'params', 'staticOptions'],
            emits: ['update:modelValue'],
            template:
              '<button :class="`select-${id}`" @click="$emit(\'update:modelValue\', { id: 16, title: \'New Value\' })">{{ modelValue?.title }}</button>',
          },
        },
      },
    });

    expect((wrapper.find('#preview_date').element as HTMLInputElement).value).toBe('2026-06-25');
    expect((wrapper.find('#preview_time').element as HTMLInputElement).value).toBe('10:30:00');
    expect((wrapper.find('#site_link').element as HTMLInputElement).value).toBe(
      'https://maps.google.com/?q=30.0444,31.2357',
    );
    expect((wrapper.find('#address').element as HTMLTextAreaElement).value).toBe(
      'Nasr City, Cairo, Egypt',
    );

    const emitted = wrapper.emitted('updateData')?.at(0)?.[0] as AddProjectPreviewParams;
    expect(emitted.toMap()).toEqual({
      engineer_id: 15,
      preview_date: '2026-06-25',
      preview_time: '10:30:00',
      site_link: 'https://maps.google.com/?q=30.0444,31.2357',
      address: 'Nasr City, Cairo, Egypt',
      project_id: 10,
      notification_type: NotificationType.URGENT,
      status: Status.READY_FOR_PRICING,
      pricing_responsible_id: 18,
      notification_message: 'Preview is ready for pricing',
    });

    expect(wrapper.find('.select-engineer_id').text()).toBe('Site Engineer');
    expect(wrapper.find('.select-pricing_responsible_id').text()).toBe('Pricing Lead');
    expect(wrapper.find('.select-status').text()).toBe('Ready for pricing');
    expect(wrapper.find('.select-notification_type').text()).toBe('Urgent');
    expect((wrapper.find('#notification_message').element as HTMLTextAreaElement).value).toBe(
      'Preview is ready for pricing',
    );
  });

  it('uses employee params filtered by engineer and pricing responsible types', () => {
    const wrapper = mount(ProjectPreviewForm, {
      global: {
        mocks: {
          $t: (key: string) => key,
        },
        stubs: {
          DatePicker: DatePickerStub,
          UpdatedCustomInputSelect: {
            name: 'UpdatedCustomInputSelect',
            props: ['params'],
            template: '<div />',
          },
        },
      },
    });

    const dynamicSelects = wrapper
      .findAllComponents({ name: 'UpdatedCustomInputSelect' })
      .filter((select) => select.props('params'));

    expect(dynamicSelects[0]?.props('params').toMap()).toMatchObject({ type: 2 });
    expect(dynamicSelects[1]?.props('params').toMap()).toMatchObject({ type: 4 });
  });

  it('renders validation errors beside their matching fields', () => {
    const wrapper = mount(ProjectPreviewForm, {
      props: {
        validationErrors: {
          engineer_id: 'Engineer is required',
          preview_date: 'Preview date is required',
          preview_time: 'Preview time is required',
        },
      },
      global: {
        mocks: {
          $t: (key: string) => key,
        },
        stubs: {
          DatePicker: DatePickerStub,
          UpdatedCustomInputSelect: {
            name: 'UpdatedCustomInputSelect',
            props: ['id'],
            template: '<div />',
          },
        },
      },
    });

    expect(wrapper.findAll('.field-error').map((error) => error.text())).toEqual([
      'Engineer is required',
      'Preview date is required',
      'Preview time is required',
    ]);
  });

  it('formats changed date and time values without a timezone day shift', async () => {
    const wrapper = mount(ProjectPreviewForm, {
      props: {
        projectId: 10,
      },
      global: {
        mocks: {
          $t: (key: string) => key,
        },
        stubs: {
          DatePicker: DatePickerStub,
          UpdatedCustomInputSelect: {
            name: 'UpdatedCustomInputSelect',
            props: ['id'],
            template: '<div />',
          },
        },
      },
    });

    await wrapper.find('#preview_date').setValue('2026-07-01');
    await wrapper.find('#preview_time').setValue('14:05');

    const emissions = wrapper.emitted('updateData') ?? [];
    const emitted = emissions.at(-1)?.[0] as AddProjectPreviewParams;

    expect(emitted.preview_date).toBe('2026-07-01');
    expect(emitted.preview_time).toBe('14:05:00');
  });

  it('does not overwrite nullable optional edit values with defaults', () => {
    const projectPreview = new ProjectPreviewShowModel({
      id: 12,
      project_id: 10,
      engineer_id: 15,
      preview_date: '2026-06-25',
      preview_time: '10:30:00',
      site_link: null,
      address: null,
      status: null,
      notification_type: null,
      notification_message: null,
      pricing_responsible: null,
    });
    const wrapper = mount(ProjectPreviewForm, {
      props: {
        projectPreview,
        isEdit: true,
      },
      global: {
        mocks: {
          $t: (key: string) => key,
        },
        stubs: {
          DatePicker: DatePickerStub,
          UpdatedCustomInputSelect: {
            name: 'UpdatedCustomInputSelect',
            props: ['id'],
            template: '<div />',
          },
        },
      },
    });

    const emitted = wrapper.emitted('updateData')?.at(0)?.[0] as AddProjectPreviewParams;

    expect(emitted.toMap()).toEqual({
      project_id: 10,
      engineer_id: 15,
      preview_date: '2026-06-25',
      preview_time: '10:30:00',
    });
  });
});
