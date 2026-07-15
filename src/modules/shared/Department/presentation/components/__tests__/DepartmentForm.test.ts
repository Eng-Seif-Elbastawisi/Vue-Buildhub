import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import TitleInterface from '@/base/Data/Models/titleInterface';
import { Type } from '../../../core/constants/Type.enum';
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
    '<button class="multi-lang-input" @click="$emit(\'update:modelValue\', { en: \'Science\', ar: \'العلوم\' })"><span class="title-en">{{ modelValue.en }}</span><span class="title-ar">{{ modelValue.ar }}</span></button>',
};

const SelectStub = {
  props: ['id', 'modelValue'],
  emits: ['update:modelValue'],
  template: `<button
      class="stage-select"
      @click="$emit('update:modelValue', newStage)"
    >
      {{ modelValue?.title ?? id }}
    </button>`,
  data: () => ({
    newStage: new TitleInterface({ id: 7, title: 'Secondary' }),
  }),
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
    const wrapper = mountForm({ type: Type.BOTH });

    await wrapper.find('.multi-lang-input').trigger('click');
    await wrapper.find('.stage-select').trigger('click');

    const events = wrapper.emitted('updateData') ?? [];
    const params = events.at(-1)?.[0] as AddDepartmentParams;
    expect(params.toMap()).toEqual({
      translations: expect.objectContaining({ title: { en: 'Science', ar: 'العلوم' } }),
      stage_id: 7,
      type: Type.BOTH,
    });
  });

  it('hydrates edit data and emits edit params for an existing department', () => {
    const department = new DepartmentModel({
      id: 5,
      translations: { title: { en: 'Existing', ar: 'القائم' } },
      stage: new TitleInterface({ id: 3, title: 'Primary' }),
      type: Type.SUPERVISION,
    });

    const wrapper = mountForm({ department });

    const events = wrapper.emitted('updateData') ?? [];
    const params = events.at(-1)?.[0] as EditDepartmentParams;
    expect(params.toMap()).toEqual({
      department_id: 5,
      translations: expect.objectContaining({ title: { en: 'Existing', ar: 'القائم' } }),
      stage_id: 3,
      type: Type.SUPERVISION,
    });
  });

  it('uses route type prop when editing an existing department', () => {
    const department = new DepartmentModel({
      id: 5,
      translations: { title: { en: 'Existing', ar: 'القائم' } },
      stage: new TitleInterface({ id: 3, title: 'Primary' }),
      type: Type.SUPERVISION,
    });

    const wrapper = mountForm({ department, type: Type.DESIGN });

    const events = wrapper.emitted('updateData') ?? [];
    const params = events.at(-1)?.[0] as EditDepartmentParams;
    expect(params.toMap()).toMatchObject({
      department_id: 5,
      type: Type.DESIGN,
    });
  });

  it('hydrates edit translation objects as English and Arabic values', () => {
    const department = new DepartmentModel({
      id: 8,
      translations: {
        title: [
          { locale: 'en', title: 'Operations' },
          { locale: 'ar', title: 'العمليات' },
        ] as unknown as Record<string, string>,
      },
      stage: new TitleInterface({
        id: 4,
        title: [
          { locale: 'en', title: 'Finishing' },
          { locale: 'ar', title: 'التشطيبات' },
        ] as unknown as string,
      }),
    });

    const wrapper = mountForm({ department });

    expect(wrapper.find('.title-en').text()).toBe('Operations');
    expect(wrapper.find('.title-ar').text()).toBe('العمليات');
    expect(wrapper.find('.stage-select').text()).toBe('Finishing / التشطيبات');
    expect(wrapper.find('.stage-select').text()).not.toContain('[object Object]');
  });

  it('clears title and selected stage when resetKey changes', async () => {
    const wrapper = mountForm({ department: DepartmentModel.example(), resetKey: 0 });

    expect(wrapper.find('.title-en').text()).toBe('Design Department');
    expect(wrapper.find('.stage-select').text()).toBe('Engineering');

    await wrapper.setProps({ resetKey: 1 });

    expect(wrapper.find('.title-en').text()).toBe('');
    expect(wrapper.find('.stage-select').text()).toBe('doc-branch');
  });
});
