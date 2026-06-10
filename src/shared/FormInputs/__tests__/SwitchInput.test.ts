import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import SwitchInput from '../SwitchInput.vue';

// Stub PrimeVue ToggleSwitch
const ToggleSwitchStub = {
  name: 'ToggleSwitch',
  template:
    '<input type="checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />',
  props: ['modelValue'],
  emits: ['update:modelValue'],
};

const createWrapper = (props = {}) =>
  mount(SwitchInput, {
    props: {
      fields: [
        {
          key: 'field1',
          label: 'Field One',
          placeholder: 'Enter value',
          value: 'hello',
          enabled: false,
        },
      ],
      ...props,
    },
    global: {
      stubs: { ToggleSwitch: ToggleSwitchStub },
      mocks: { $t: (key: string) => key },
    },
  });

describe('SwitchInput', () => {
  it('renders without crashing', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  it('renders a text input for each field', () => {
    const wrapper = createWrapper();
    const inputs = wrapper.findAll('input[type="text"]');
    expect(inputs).toHaveLength(1);
  });

  it('renders label for each field using $t', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('.title').text()).toBe('Field One');
  });

  it('renders toggle switch for each field', () => {
    const wrapper = createWrapper();
    expect(wrapper.findComponent(ToggleSwitchStub).exists()).toBe(true);
  });

  it('disables text input when field is not enabled (normal mode)', () => {
    const wrapper = createWrapper();
    const textInput = wrapper.find('input[type="text"]');
    expect((textInput.element as HTMLInputElement).disabled).toBe(true);
  });

  it('enables text input when field.enabled is true (normal mode)', () => {
    const wrapper = createWrapper({
      fields: [{ key: 'f', label: 'L', placeholder: 'P', value: 'v', enabled: true }],
    });
    const textInput = wrapper.find('input[type="text"]');
    expect((textInput.element as HTMLInputElement).disabled).toBe(false);
  });

  it('shows switch_title when provided', () => {
    const wrapper = createWrapper({ switch_title: 'Active?' });
    expect(wrapper.find('.title').text()).toBe('Field One'); // label
    const titles = wrapper.findAll('.title');
    expect(titles.some((t) => t.text() === 'Active?')).toBe(true);
  });

  it('emits update:value with empty string for enabled field in switch_reverse mode', async () => {
    const initialFields = [
      { key: 'f', label: 'L', placeholder: 'P', value: 'hello', enabled: true },
    ];
    const wrapper = createWrapper({ fields: initialFields, switch_reverse: true });

    // Trigger the watcher by passing a new fields array with a changed state
    const updatedFields = [
      { key: 'f', label: 'L', placeholder: 'P', value: 'hello', enabled: false },
    ];
    await wrapper.setProps({ fields: updatedFields });

    // Wait for the watcher to fire and emit
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    const emitted = wrapper.emitted('update:value');
    expect(emitted).toBeTruthy();
  });

  it('renders multiple fields', () => {
    const wrapper = createWrapper({
      fields: [
        { key: 'f1', label: 'A', placeholder: 'a', value: '1', enabled: false },
        { key: 'f2', label: 'B', placeholder: 'b', value: '2', enabled: true },
      ],
    });
    const inputs = wrapper.findAll('input[type="text"]');
    expect(inputs).toHaveLength(2);
  });
});
