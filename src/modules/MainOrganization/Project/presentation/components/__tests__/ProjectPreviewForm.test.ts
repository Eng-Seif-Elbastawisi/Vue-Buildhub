import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import ProjectPreviewForm from '../ProjectPreviewForm.vue';
import type AddProjectPreviewParams from '../../../core/params/add.project.preview.params';
import ProjectShowModel from '../../../core/models/project.show.model';

vi.mock('@/modules/MainOrganization/employee/presentation/controllers/employee.controller', () => ({
  default: {
    getInstance: vi.fn(() => ({ fetchAsOptions: vi.fn() })),
  },
}));

describe('ProjectPreviewForm.vue', () => {
  it('hydrates edit values and emits preview params', () => {
    const project = new ProjectShowModel({
      engineer: { id: 15, title: 'Site Engineer' },
      preview_date: '2026-06-25',
      preview_time: '10:30:00',
      site_link: 'https://maps.google.com/?q=30.0444,31.2357',
      address: 'Nasr City, Cairo, Egypt',
    });

    const wrapper = mount(ProjectPreviewForm, {
      props: {
        Project: project,
        isEdit: true,
      },
      global: {
        mocks: {
          $t: (key: string) => key,
        },
        stubs: {
          UpdatedCustomInputSelect: {
            name: 'UpdatedCustomInputSelect',
            props: ['modelValue', 'params'],
            emits: ['update:modelValue'],
            template: '<button class="engineer-select" @click="$emit(\'update:modelValue\', { id: 16, title: \'New Engineer\' })">{{ modelValue?.title }}</button>',
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
    });
  });

  it('uses employee params filtered by engineer type', () => {
    const wrapper = mount(ProjectPreviewForm, {
      global: {
        mocks: {
          $t: (key: string) => key,
        },
        stubs: {
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
