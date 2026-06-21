import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import HeaderItem from '../HeaderItem.vue';

describe('Stages/HeaderItem', () => {
  it('renders without errors', () => {
    const wrapper = mount(HeaderItem, {
      props: { item: { header: 'h', content: 'c', id: 1 } },
    });
    expect(wrapper.exists()).toBe(true);
  });

  it('displays item header and content', () => {
    const wrapper = mount(HeaderItem, {
      props: { item: { header: 'Stage Header', content: 'Stage Content', id: 7 } },
    });
    expect(wrapper.text()).toContain('Stage Header');
    expect(wrapper.text()).toContain('Stage Content');
    expect(wrapper.text()).toContain('7');
  });

  it('renders gracefully with undefined item fields', () => {
    const wrapper = mount(HeaderItem, { props: { item: {} } });
    expect(wrapper.exists()).toBe(true);
  });
});
