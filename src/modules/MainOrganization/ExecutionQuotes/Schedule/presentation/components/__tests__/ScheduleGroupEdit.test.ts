import { expect, it } from 'vitest';
import ScheduleGroupEdit from '../ScheduleGroupEdit.vue';
import { mountScheduleRoute } from './routeHarness';
it('loads edit on direct navigation without relying on an earlier Index visit', async () => {
  const { wrapper, quoteRequest } = await mountScheduleRoute(
    ScheduleGroupEdit,
    '/schedule/101/201',
  );
  expect(wrapper.text()).toContain('schedule.selection_identity_pending');
  wrapper.unmount();
  quoteRequest.mockRestore();
});
