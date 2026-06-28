import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import TitleInterface from '@/base/Data/Models/titleInterface';
import DepartmentModel from '../../../core/models/department.model';
import type AddDepartmentParams from '../../../core/params/add.department.params';
import type EditDepartmentParams from '../../../core/params/edit.department.params';
import DepartmentForm from '../DepartmentForm.vue';

vi.mock('@/modules/Stages/presentation/controllers/stage.controller', () => ({
  default: { getInstance: () => ({ fetchAsOptions: vi.fn().mockResolvedValue([]) }) },
}));

const MultiLangInputStub = {
  props: ['modelValue'],
  emits: ['update:modelValue'],
  template:
    "<button class=\"multi-lang-input\" @click=\"$emit('update:modelValue', { en: 'Science', ar: 'العلوم' })\">title</button>",
};

const SelectStub = {
  emits: ['update:modelValue'],
  template:
    '<button class="stage-select" @click="$emit(\'update:modelValue\', newStage)">stage</button>',
  data: () => ({ newStage: new TitleInterface({ id: 7, title: 'Secondary' }) }),
};

const mountForm = (props = {}) =>
  mount(DepartmentForm, {
    props,
    global: {
      mocks: { $t: (key: string) => key },
      stubs: {
        MultiLangInput: MultiLangInputStub,
        UpdatedCustomInputSelect: SelectStub,
      },
    },
  });

describe('DepartmentForm', () => {
  it('emits add params containing translated title and selected stage id', async () => {
    const wrapper = mountForm();

    await wrapper.find('.multi-lang-input').trigger('click');
    await wrapper.find('.stage-select').trigger('click');

    const events = wrapper.emitted('updateData') ?? [];
    const params = events.at(-1)?.[0] as AddDepartmentParams;
    expect(params.toMap()).toEqual({
      translations: expect.objectContaining({ title: { en: 'Science', ar: 'العلوم' } }),
      stage_id: 7,
    });
  });

  it('hydrates edit data and emits edit params for an existing department', () => {
    const department = new DepartmentModel({
      id: 5,
      translations: { title: { en: 'Existing', ar: 'القائم' } },
      stage: new TitleInterface({ id: 3, title: 'Primary' }),
    });

    const wrapper = mountForm({ department });

    const events = wrapper.emitted('updateData') ?? [];
    const params = events.at(-1)?.[0] as EditDepartmentParams;
    expect(params.toMap()).toEqual({
      department_id: 5,
      translations: expect.objectContaining({ title: { en: 'Existing', ar: 'القائم' } }),
      stage_id: 3,
    });
  });
});
