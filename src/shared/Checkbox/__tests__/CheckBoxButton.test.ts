import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import CheckBoxButton from '../CheckBoxButton.vue';

// Mock PrimeVue Checkbox
vi.mock('primevue/checkbox', () => ({
  default: {
    template: '<input type="checkbox" :checked="modelValue" @change="$emit(\'change\', $event)" />',
    props: ['modelValue', 'binary'],
    emits: ['change', 'update:modelValue'],
  },
}));

// Asset mocks are in setup.ts

const createWrapper = (props = {}) =>
  mount(CheckBoxButton, {
    props: {
      title: 'Test Checkbox',
      ...props,
    },
    global: {
      mocks: { $t: (key: string) => key },
    },
  });

describe('CheckBoxButton', () => {
  it('renders without crashing', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  it('renders the title text', () => {
    const wrapper = createWrapper({ title: 'Agreement' });
    expect(wrapper.text()).toContain('Agreement');
  });

  it('renders with a checkbox image', () => {
    const wrapper = createWrapper();
    const img = wrapper.find('img');
    expect(img.exists()).toBe(true);
    expect(img.attributes('alt')).toBe('checkbox-icon');
  });

  it('uses custom image when img prop is provided', () => {
    const wrapper = createWrapper({ img: 'custom-image.png' });
    const img = wrapper.find('img');
    expect(img.attributes('src')).toBe('custom-image.png');
  });

  it('uses default CheckBoxImg when no img prop', () => {
    const wrapper = createWrapper();
    const img = wrapper.find('img');
    expect(img.attributes('src')).toBe('mocked-checkbox.png');
  });

  it('initializes checked state from prop', () => {
    const wrapper = createWrapper({ checked: true });
    expect(wrapper.exists()).toBe(true);
  });

  it('has the correct root class', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('.checkbox-button').exists()).toBe(true);
  });

  it('renders label with checkbox-data class', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('.checkbox-data').exists()).toBe(true);
  });
});
