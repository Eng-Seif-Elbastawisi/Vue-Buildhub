import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import MeasurementModel from '../../../core/models/measurement.model';
import AddMeasurementParams from '../../../core/params/add.measurement.params';
import EditMeasurementParams from '../../../core/params/edit.measurement.params';
import MeasurementForm from '../MeasurementForm.vue';

const global = {
  stubs: {
    MultiLangInput: {
      props: ['modelValue', 'fieldKey'],
      emits: ['update:modelValue'],
      template:
        '<input :class="`multi-lang-input-${fieldKey}`" :value="modelValue.en ?? \'\'" @input="$emit(\'update:modelValue\', { en: \'Updated\', ar: \'Updated AR\' })" />',
    },
    ToggleSwitch: {
      props: ['modelValue', 'disabled', 'inputId'],
      emits: ['update:modelValue'],
      template:
        '<input type="checkbox" :id="inputId" class="toggle-switch-stub" :checked="modelValue" :disabled="disabled" @change="$emit(\'update:modelValue\', $event.target.checked)" />',
    },
  },
  mocks: {
    $t: (key: string) => key,
  },
};

describe('MeasurementForm', () => {
  it('emits add params with default status active when no measurement is provided', () => {
    const wrapper = mount(MeasurementForm, { global });
    const emittedParams = wrapper.emitted('updateData')?.[0]?.[0] as AddMeasurementParams;

    expect(emittedParams).toBeInstanceOf(AddMeasurementParams);
    expect(emittedParams.status).toBe(true);
  });

  it('emits edit params when a measurement is provided with correct status', () => {
    const wrapper = mount(MeasurementForm, {
      global,
      props: { measurement: MeasurementModel.example },
    });
    const emittedParams = wrapper.emitted('updateData')?.[0]?.[0] as EditMeasurementParams;

    expect(emittedParams).toBeInstanceOf(EditMeasurementParams);
    expect(emittedParams.id).toBe(MeasurementModel.example.id);
    expect(emittedParams.status).toBe(MeasurementModel.example.status);
  });

  it('disables the field groups while loading', () => {
    const wrapper = mount(MeasurementForm, { global, props: { loading: true } });
    expect(wrapper.find('.field-group.disabled').exists()).toBe(true);
  });

  it('updates status and emits updated params on toggle', async () => {
    const wrapper = mount(MeasurementForm, { global });
    const toggle = wrapper.find('.toggle-switch-stub');

    expect((toggle.element as HTMLInputElement).checked).toBe(true);

    await toggle.setValue(false);

    const emitted = wrapper.emitted('updateData');
    expect(emitted).toBeTruthy();
    const lastParam = emitted![emitted!.length - 1][0] as AddMeasurementParams;
    expect(lastParam.status).toBe(false);
  });
});
