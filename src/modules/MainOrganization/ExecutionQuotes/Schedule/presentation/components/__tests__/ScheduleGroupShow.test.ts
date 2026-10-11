import { expect, it } from 'vitest';
import ScheduleGroupShow from '../ScheduleGroupShow.vue';
import { mountScheduleRoute } from './routeHarness';
it('loads show on direct navigation without relying on an earlier Index visit', async () => {
  const { wrapper, quoteRequest } = await mountScheduleRoute(
    ScheduleGroupShow,
    '/schedule/101/201',
  );
  expect(wrapper.text()).toContain('Main Execution Timeline');
  wrapper.unmount();
  quoteRequest.mockRestore();
});
