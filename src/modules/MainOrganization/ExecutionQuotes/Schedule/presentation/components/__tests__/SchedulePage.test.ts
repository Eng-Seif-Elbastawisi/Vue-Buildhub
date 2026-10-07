import { expect, it } from 'vitest';
import ScheduleGroupShow from '../ScheduleGroupShow.vue';
import { mountScheduleRoute } from './routeHarness';
it('rejects owner and group IDs separately without fetching an invalid owner', async () => {
  const { wrapper, quoteRequest } = await mountScheduleRoute(ScheduleGroupShow, '/schedule/101/0');
  expect(wrapper.text()).toContain('schedule.invalid_ids');
  expect(quoteRequest).not.toHaveBeenCalled();
  wrapper.unmount();
  quoteRequest.mockRestore();
});
