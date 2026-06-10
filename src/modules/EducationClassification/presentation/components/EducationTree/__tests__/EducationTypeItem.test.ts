import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import EducationTypeItem from '../EducationTypeItem.vue';

describe('EducationTypeItem', () => {
  const mockNode = {
    id: '1',
    name: 'University',
    level: 0,
    children: [
      {
        id: '2',
        name: 'Faculty',
        level: 1,
        children: [],
      },
    ],
  };

  const defaultProps = {
    node: mockNode,
    maxLevels: 3,
  };

  const mountComponent = (options = {}) =>
    mount(EducationTypeItem, {
      ...options,
      global: {
        stubs: {
          NodeIcon: true,
          EducationTypeItem: true,
        },
        config: {
          globalProperties: {
            $t: (key: string) => key,
          },
        },
        ...options.global,
      },
    });

  it('renders node name', () => {
    const wrapper = mountComponent({
      props: defaultProps,
    });

    expect(wrapper.text()).toContain('University');
  });

  it('toggles children visibility when toggle button is clicked', async () => {
    const wrapper = mountComponent({
      props: defaultProps,
    });

    const toggleBtn = wrapper.find('.toggle-btn');
    expect(toggleBtn.exists()).toBe(true);

    // Initial state is open (based on node.children.length > 0 and isOpen ref)
    expect(wrapper.find('.children-wrapper').exists()).toBe(true);

    await toggleBtn.trigger('click');
    expect(wrapper.find('.children-wrapper').exists()).toBe(false);
  });

  it('emits select when node row is clicked', async () => {
    const wrapper = mountComponent({
      props: defaultProps,
    });

    await wrapper.find('.node-row').trigger('click');
    expect(wrapper.emitted('select')).toBeTruthy();
    expect(wrapper.emitted('select')?.[0]).toEqual([mockNode]);
  });

  it('emits add-branch when add button is clicked', async () => {
    const wrapper = mountComponent({
      props: defaultProps,
    });

    const addBtn = wrapper.find('.icon-btn[title="Add child"]');
    await addBtn.trigger('click');

    expect(wrapper.emitted('add-branch')).toBeTruthy();
    expect(wrapper.emitted('add-branch')?.[0]).toEqual([{ node: mockNode, level: 1 }]);
  });

  it('hides add button when node is at max level', () => {
    const deepNode = {
      id: '3',
      name: 'Deep',
      level: 2,
      children: [],
    };

    const wrapper = mountComponent({
      props: {
        node: deepNode,
        maxLevels: 3,
      },
    });

    expect(wrapper.find('.icon-btn[title="Add child"]').exists()).toBe(false);
  });
});
