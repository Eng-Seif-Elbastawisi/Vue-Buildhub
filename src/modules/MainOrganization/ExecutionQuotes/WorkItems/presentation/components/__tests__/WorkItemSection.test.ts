import { expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import WorkItemSection from '../WorkItemSection.vue';
it('renders recoverable error and emits retry, then renders empty/read state', async () => {
  const wrapper = mount(WorkItemSection, {
    props: {
      title: 'Tasks',
      loading: false,
      error: 'Network error',
      empty: false,
      emptyMessage: 'Create a task',
    },
    global: { mocks: { $t: (key: string) => key } },
  });
  expect(wrapper.get('[role="alert"]').text()).toContain('Network error');
  await wrapper.get('button').trigger('click');
  expect(wrapper.emitted('retry')).toHaveLength(1);
  await wrapper.setProps({ error: undefined, empty: true });
  expect(wrapper.text()).toContain('Create a task');
  await wrapper.setProps({ loading: true });
  expect(wrapper.attributes('aria-busy')).toBe('true');
  wrapper.unmount();
});

it('shows a real zero count but hides counts while loading or failed', async () => {
  const wrapper = mount(WorkItemSection, {
    props: {
      title: 'Tasks',
      icon: 'pi pi-check-square',
      count: 0,
      loading: false,
      empty: true,
      emptyMessage: 'Create a task',
    },
    global: { mocks: { $t: (key: string) => key } },
  });
  expect(wrapper.get('.work-items-section-count').text()).toBe('0');
  expect(wrapper.get('.work-items-section-count').attributes('aria-label')).toBe('Tasks: 0');
  await wrapper.setProps({ loading: true });
  expect(wrapper.find('.work-items-section-count').exists()).toBe(false);
  await wrapper.setProps({ loading: false, error: 'Network error' });
  expect(wrapper.find('.work-items-section-count').exists()).toBe(false);
  wrapper.unmount();
});
