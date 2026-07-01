import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ClientSourceModel from '../../../core/models/client.source.model';
import AddClientSourceParams from '../../../core/params/add.client.source.params';
import EditClientSourceParams from '../../../core/params/edit.client.source.params';
import ClientSourceForm from '../ClientSourceForm.vue';

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

describe('ClientSourceForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('emits add params when no client source is provided', () => {
    const wrapper = mount(ClientSourceForm, { global: globalConfig });
    const emittedParams = wrapper.emitted('updateData')?.[0]?.[0];

    expect(emittedParams).toBeInstanceOf(AddClientSourceParams);
  });

  it('emits edit params when a client source is provided', () => {
    const wrapper = mount(ClientSourceForm, {
      global: globalConfig,
      props: { clientSource: ClientSourceModel.example },
    });
    const emittedParams = wrapper.emitted('updateData')?.[0]?.[0] as EditClientSourceParams;

    expect(emittedParams).toBeInstanceOf(EditClientSourceParams);
    expect(emittedParams.id).toBe(ClientSourceModel.example.id);
  });

  it('emits updateData when multilingual input changes', async () => {
    const wrapper = mount(ClientSourceForm, { global: globalConfig });

    await wrapper.find('.multi-lang-input').trigger('input');

    expect(wrapper.emitted('updateData')).toBeTruthy();
  });

  it('disables the field group while loading', () => {
    const wrapper = mount(ClientSourceForm, { global: globalConfig, props: { loading: true } });
    expect(wrapper.find('.field-group.disabled').exists()).toBe(true);
  });

  it('clears multilingual values when resetKey changes', async () => {
    const wrapper = mount(ClientSourceForm, {
      global: globalConfig,
      props: { clientSource: ClientSourceModel.example, resetKey: 0 },
    });

    expect(wrapper.find<HTMLInputElement>('.multi-lang-input').element.value).toBe('title');

    await wrapper.setProps({ resetKey: 1 });

    expect(wrapper.find<HTMLInputElement>('.multi-lang-input').element.value).toBe('');
  });
});
