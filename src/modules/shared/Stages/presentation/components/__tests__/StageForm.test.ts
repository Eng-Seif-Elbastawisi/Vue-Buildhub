import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import StageModel from '../../../core/models/stage.model';
import AddStageParams from '../../../core/params/add.stges.params';
import EditStageParams from '../../../core/params/edit.stage.params';
import StageForm from '../StageForm.vue';

const globalConfig = {
  stubs: {
    MultiLangInput: {
      props: ['modelValue'],
      emits: ['update:modelValue'],
      template:
        "<input class=\"multi-lang-input\" :value=\"modelValue.en ?? ''\" @input=\"$emit('update:modelValue', { en: 'Updated', ar: 'Updated AR' })\" />",
    },
  },
  mocks: {
    $t: (msg: string) => msg,
  },
};

describe('StageForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form fields', () => {
    const wrapper = mount(StageForm, { global: globalConfig });
    expect(wrapper.find('.form-fields').exists()).toBe(true);
    expect(wrapper.find('.multi-lang-input').exists()).toBe(true);
  });

  it('emits add params when no stage is provided', () => {
    const wrapper = mount(StageForm, { global: globalConfig });
    const emittedParams = wrapper.emitted('updateData')?.[0]?.[0];

    expect(emittedParams).toBeInstanceOf(AddStageParams);
  });

  it('emits edit params when a stage is provided', () => {
    const wrapper = mount(StageForm, {
      global: globalConfig,
      props: { stage: StageModel.example },
    });
    const emittedParams = wrapper.emitted('updateData')?.[0]?.[0] as EditStageParams;

    expect(emittedParams).toBeInstanceOf(EditStageParams);
    expect(emittedParams.id).toBe(StageModel.example.id);
  });

  it('emits updateData when multilingual input changes', async () => {
    const wrapper = mount(StageForm, { global: globalConfig });

    await wrapper.find('.multi-lang-input').trigger('input');

    expect(wrapper.emitted('updateData')).toBeTruthy();
  });

  it('disables the field group while loading', () => {
    const wrapper = mount(StageForm, { global: globalConfig, props: { loading: true } });
    expect(wrapper.find('.field-group.disabled').exists()).toBe(true);
  });

  it('clears multilingual values when resetKey changes', async () => {
    const wrapper = mount(StageForm, {
      global: globalConfig,
      props: { stage: StageModel.example, resetKey: 0 },
    });

    expect(wrapper.find<HTMLInputElement>('.multi-lang-input').element.value).toBe('title');

    await wrapper.setProps({ resetKey: 1 });

    expect(wrapper.find<HTMLInputElement>('.multi-lang-input').element.value).toBe('');
  });
});
