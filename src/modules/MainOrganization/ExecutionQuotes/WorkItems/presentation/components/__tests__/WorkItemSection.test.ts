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
