import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import FormLoader from '../FormLoader.vue';

describe('FormLoader', () => {
  it('renders without errors', () => {
    const wrapper = mount(FormLoader, {
      props: { inputsCount: 4 },
    });
    expect(wrapper.exists()).toBe(true);
  });
});
