import { expect, it } from 'vitest';
import ScheduleGroupAdd from '../ScheduleGroupAdd.vue';
import { mountScheduleRoute } from './routeHarness';
it('loads add on direct navigation without relying on an earlier Index visit', async () => {
  const { wrapper, quoteRequest } = await mountScheduleRoute(ScheduleGroupAdd, '/schedule/101');
  expect(wrapper.find('form').exists()).toBe(true);
  wrapper.unmount();
  quoteRequest.mockRestore();
});
