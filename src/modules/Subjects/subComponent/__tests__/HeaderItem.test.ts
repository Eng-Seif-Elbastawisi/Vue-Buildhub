import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import HeaderItem from '../HeaderItem.vue';

describe('Subjects/HeaderItem', () => {
  it('renders without errors', () => {
    const wrapper = mount(HeaderItem, {
      props: { item: { header: 'h', content: 'c', id: 1 } },
    });
    expect(wrapper.exists()).toBe(true);
  });

  it('displays item header and content', () => {
    const wrapper = mount(HeaderItem, {
      props: { item: { header: 'Subject Header', content: 'Subject Content', id: 3 } },
    });
    expect(wrapper.text()).toContain('Subject Header');
    expect(wrapper.text()).toContain('Subject Content');
    expect(wrapper.text()).toContain('3');
  });

  it('renders gracefully with undefined item fields', () => {
    const wrapper = mount(HeaderItem, { props: { item: {} } });
    expect(wrapper.exists()).toBe(true);
  });
});
