import { expect, it } from 'vitest';
import ScheduleIndex from '../ScheduleIndex.vue';
import { mountScheduleRoute } from './routeHarness';
it('loads index on direct navigation without relying on an earlier Index visit', async () => {
  const { wrapper, quoteRequest } = await mountScheduleRoute(ScheduleIndex, '/schedule/101');
  expect(wrapper.text()).toContain('Main Execution Timeline');
  wrapper.unmount();
  quoteRequest.mockRestore();
});
