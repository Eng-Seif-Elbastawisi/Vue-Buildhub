import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import TitleInterface from '@/base/Data/Models/titleInterface';
import TermModel from '../../../core/models/term.model';
import type AddTermParams from '../../../core/params/add.term.params';
import type EditTermParams from '../../../core/params/edit.term.params';
import TermForm from '../TermForm.vue';

vi.mock('@/modules/Department/presentation/controllers/department.controller', () => ({
  default: { getInstance: () => ({ fetchAsOptions: vi.fn().mockResolvedValue([]) }) },
}));

const MultiLangInputStub = {
  props: ['modelValue'],
  emits: ['update:modelValue'],
  template:
    "<button class=\"multi-lang-input\" @click=\"$emit('update:modelValue', { en: 'First Term', ar: 'الفصل الأول' })\">title</button>",
};

const SelectStub = {
  emits: ['update:modelValue'],
  template:
    '<button class="department-select" @click="$emit(\'update:modelValue\', department)">department</button>',
  data: () => ({ department: new TitleInterface({ id: 7, title: 'Science' }) }),
};

const mountForm = (props = {}) =>
  mount(TermForm, {
    props,
    global: {
      mocks: { $t: (key: string) => key },
      stubs: {
        MultiLangInput: MultiLangInputStub,
        UpdatedCustomInputSelect: SelectStub,
      },
    },
  });

describe('TermForm', () => {
  it('emits add params containing translated title and selected department id', async () => {
    const wrapper = mountForm();

    await wrapper.find('.multi-lang-input').trigger('click');
    await wrapper.find('.department-select').trigger('click');

    const events = wrapper.emitted('updateData') ?? [];
    const params = events.at(-1)?.[0] as AddTermParams;
    expect(params.toMap()).toEqual({
      translations: expect.objectContaining({ title: { en: 'First Term', ar: 'الفصل الأول' } }),
      department_id: 7,
    });
  });

  it('hydrates edit data and emits edit params for an existing term', () => {
    const term = new TermModel({
      id: 5,
      translations: { title: { en: 'Existing Term', ar: 'الفصل القائم' } },
      department: new TitleInterface({ id: 3, title: 'Math' }),
    });

    const wrapper = mountForm({ term });

    const events = wrapper.emitted('updateData') ?? [];
    const params = events.at(-1)?.[0] as EditTermParams;
    expect(params.toMap()).toEqual({
      id: 5,
      translations: expect.objectContaining({
        title: { en: 'Existing Term', ar: 'الفصل القائم' },
      }),
      department_id: 3,
    });
  });
});
