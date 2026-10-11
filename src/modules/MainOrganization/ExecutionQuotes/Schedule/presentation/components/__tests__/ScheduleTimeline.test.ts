import { mount } from '@vue/test-utils';
import { expect, it } from 'vitest';
import ScheduleTimeline from '../ScheduleTimeline.vue';
import { groupFixture } from '../../controllers/__tests__/fixtures';
it('uses supplied date-only strings and never fabricates unavailable dates', () => {
  const wrapper = mount(ScheduleTimeline, {
    props: { groups: [groupFixture(201, '2026-10-20'), groupFixture(202)] },
    global: { mocks: { $t: (key: string) => key } },
  });
  expect(wrapper.text()).toContain('2026-10-20');
  expect(wrapper.findAll('li')[1]?.text()).toContain('schedule.not_available');
  wrapper.unmount();
});
