import { mount } from '@vue/test-utils';
import { expect, it } from 'vitest';
import ProjectManagementShortcut from '../ProjectManagementShortcut.vue';
const mountShortcut = (state: 'available' | 'loading' | 'error' | 'unavailable') =>
  mount(ProjectManagementShortcut, {
    props: {
      title: 'Schedule',
      description: 'Timeline planning',
      icon: 'pi pi-calendar',
      to: '/schedule/140',
      state,
      status: null,
      metrics: [
        { label: 'Groups', value: 0 },
        { label: 'Finish', value: undefined },
      ],
    },
    global: {
      mocks: { $t: (key: string) => key },
      stubs: { RouterLink: { props: ['to'], template: '<a :href="to"><slot /></a>' } },
    },
  });
it.each(['loading', 'error', 'unavailable'] as const)(
  'reports honest %s metrics without displaying a fake count',
  (state) => {
    const wrapper = mountShortcut(state);
    expect(wrapper.find('dl').exists()).toBe(false);
    expect(wrapper.text()).toContain(
      state === 'loading'
        ? 'schedule.loading'
        : state === 'error'
          ? 'schedule.metrics_error'
          : 'schedule.not_available',
    );
    expect(wrapper.get('a').attributes('href')).toBe('/schedule/140');
    wrapper.unmount();
  },
);
it('retains an actual zero count and unavailable finish while making the whole shortcut keyboard accessible', () => {
  const wrapper = mountShortcut('available');
  expect(wrapper.findAll('dd').map((cell) => cell.text())).toEqual(['0', 'schedule.not_available']);
  expect(wrapper.find('.project-shortcut__badge').exists()).toBe(false);
  expect(wrapper.get('a').attributes('href')).toBe('/schedule/140');
  wrapper.unmount();
});
