import { mount } from '@vue/test-utils';
import { expect, it } from 'vitest';
import ScheduleGroupCard from '../ScheduleGroupCard.vue';
import { groupFixture } from '../../controllers/__tests__/fixtures';
it('shows one group duration, unavailable dates and sorting boundaries', () => {
  const wrapper = mount(ScheduleGroupCard, {
    props: {
      group: groupFixture(),
      sequence: 1,
      basePath: '/mainportal/execution-quotes/show/101/schedule',
      busy: false,
      earlier: false,
      later: false,
    },
    global: {
      mocks: { $t: (key: string) => key },
      stubs: { RouterLink: { template: '<a><slot /></a>' } },
    },
  });
  expect(wrapper.text()).toContain('6 task_assignment.duration_types.day');
  expect(wrapper.text()).toContain('schedule.not_available');
  for (const action of ['schedule.earlier', 'schedule.later'])
    expect(
      wrapper
        .findAll('button')
        .find((button) => button.text() === action)
        ?.attributes('disabled'),
    ).toBeDefined();
  wrapper.unmount();
});
