import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import AppInput from '../AppInput.vue';

describe('AppInput', () => {
  it('renders without errors', () => {
    const wrapper = mount(AppInput, {
      props: { modelValue: [] },
    });
    expect(wrapper.exists()).toBe(true);
  });
});
