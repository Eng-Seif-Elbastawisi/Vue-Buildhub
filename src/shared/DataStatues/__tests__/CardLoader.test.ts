import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import CardLoader from '../CardLoader.vue';

describe('CardLoader', () => {
  it('renders without errors', () => {
    const wrapper = mount(CardLoader, {
      props: { rows: 2, cols: 3 },
    });
    expect(wrapper.exists()).toBe(true);
  });
});
