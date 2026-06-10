import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import ContentItem from '../ContentItem.vue';

describe('Subjects/ContentItem', () => {
  it('renders without errors', () => {
    const wrapper = mount(ContentItem, {
      props: { item: { content: 'c', header: 'h', id: 1, text: 't' } },
    });
    expect(wrapper.exists()).toBe(true);
  });

  it('displays item content fields', () => {
    const wrapper = mount(ContentItem, {
      props: { item: { content: 'Physics', header: 'Subject 1', id: 5, text: 'Info' } },
    });
    expect(wrapper.text()).toContain('Physics');
    expect(wrapper.text()).toContain('Subject 1');
    expect(wrapper.text()).toContain('5');
    expect(wrapper.text()).toContain('Info');
  });

  it('renders gracefully with undefined item fields', () => {
    const wrapper = mount(ContentItem, { props: { item: {} } });
    expect(wrapper.exists()).toBe(true);
  });
});
