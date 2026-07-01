import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import ContentItem from '../ContentItem.vue';

describe('Stages/ContentItem', () => {
  it('renders without errors', () => {
    const wrapper = mount(ContentItem, {
      props: { item: { content: 'c', header: 'h', id: 1, text: 't' } },
    });
    expect(wrapper.exists()).toBe(true);
  });

  it('displays item content fields', () => {
    const wrapper = mount(ContentItem, {
      props: { item: { content: 'Math', header: 'Stage 1', id: 42, text: 'Details' } },
    });
    expect(wrapper.text()).toContain('Math');
    expect(wrapper.text()).toContain('Stage 1');
    expect(wrapper.text()).toContain('42');
    expect(wrapper.text()).toContain('Details');
  });

  it('renders gracefully with undefined item fields', () => {
    const wrapper = mount(ContentItem, { props: { item: {} } });
    expect(wrapper.exists()).toBe(true);
  });
});
