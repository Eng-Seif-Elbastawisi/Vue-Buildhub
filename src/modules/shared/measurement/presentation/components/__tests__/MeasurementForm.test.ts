import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import MeasurementModel from '../../../core/models/measurement.model';
import AddMeasurementParams from '../../../core/params/add.measurement.params';
import EditMeasurementParams from '../../../core/params/edit.measurement.params';
import MeasurementForm from '../MeasurementForm.vue';

const global = {
  stubs: {
    MultiLangInput: {
      props: ['modelValue'],
      emits: ['update:modelValue'],
      template:
        "<input class=\"multi-lang-input\" :value=\"modelValue.en ?? ''\" @input=\"$emit('update:modelValue', { en: 'Updated', ar: 'Updated AR' })\" />",
    },
  },
  mocks: {
    $t: (key: string) => key,
  },
};

describe('MeasurementForm', () => {
  it('emits add params when no measurement is provided', () => {
    const wrapper = mount(MeasurementForm, { global });
    const emittedParams = wrapper.emitted('updateData')?.[0]?.[0];

    expect(emittedParams).toBeInstanceOf(AddMeasurementParams);
  });

  it('emits edit params when a measurement is provided', () => {
    const wrapper = mount(MeasurementForm, {
      global,
      props: { stage: MeasurementModel.example },
    });
    const emittedParams = wrapper.emitted('updateData')?.[0]?.[0] as EditMeasurementParams;

    expect(emittedParams).toBeInstanceOf(EditMeasurementParams);
    expect(emittedParams.id).toBe(MeasurementModel.example.id);
  });

  it('disables the field group while loading', () => {
    const wrapper = mount(MeasurementForm, { global, props: { loading: true } });
    expect(wrapper.find('.field-group.disabled').exists()).toBe(true);
  });

  it('clears multilingual values when resetKey changes', async () => {
    const wrapper = mount(MeasurementForm, {
      global,
      props: { stage: MeasurementModel.example, resetKey: 0 },
    });

    expect(wrapper.find<HTMLInputElement>('.multi-lang-input').element.value).toBe('title');

    await wrapper.setProps({ resetKey: 1 });

    expect(wrapper.find<HTMLInputElement>('.multi-lang-input').element.value).toBe('');
  });
});
