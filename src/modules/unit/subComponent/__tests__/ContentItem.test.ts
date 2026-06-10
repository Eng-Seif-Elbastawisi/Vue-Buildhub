import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import ContentItem from '../ContentItem.vue';

describe('unit/ContentItem', () => {
  it('renders without errors', () => {
    const wrapper = mount(ContentItem, {
      props: { item: { content: 'c', header: 'h', id: 1, text: 't' } },
    });
    expect(wrapper.exists()).toBe(true);
  });
});
