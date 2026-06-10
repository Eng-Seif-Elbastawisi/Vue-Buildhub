import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import HeaderItem from '../HeaderItem.vue';

describe('unit/HeaderItem', () => {
  it('renders without errors', () => {
    const wrapper = mount(HeaderItem, {
      props: { item: { header: 'h', content: 'c', id: 1 } },
    });
    expect(wrapper.exists()).toBe(true);
  });
});
