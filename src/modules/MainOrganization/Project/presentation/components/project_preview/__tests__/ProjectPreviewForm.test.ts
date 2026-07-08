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
      engineer: { id: 15, title: 'Site Engineer' },
      preview_date: '2026-06-25',
      preview_time: '10:30:00',
      site_link: 'https://maps.google.com/?q=30.0444,31.2357',
      address: 'Nasr City, Cairo, Egypt',
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
            props: ['modelValue', 'params'],
            emits: ['update:modelValue'],
            template:
              '<button class="engineer-select" @click="$emit(\'update:modelValue\', { id: 16, title: \'New Engineer\' })">{{ modelValue?.title }}</button>',
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
      project_id: undefined,
      notification_type: NotificationType.LOW,
      status: Status.NEED_ADDITIONAL_VISIT,
      pricing_responsible_id: undefined,
      notification_message: '',
    });
  });

  it('uses employee params filtered by engineer type', () => {
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

    const select = wrapper.findComponent({ name: 'UpdatedCustomInputSelect' });
    expect(select.props('params').toMap()).toMatchObject({ type: 2 });
  });
});
