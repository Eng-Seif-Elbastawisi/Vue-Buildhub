import { expect, it } from 'vitest';
import ScheduleGroupEdit from '../ScheduleGroupEdit.vue';
import { mountScheduleRoute } from './routeHarness';
it('loads edit on direct navigation without relying on an earlier Index visit', async () => {
  const { wrapper, quoteRequest } = await mountScheduleRoute(
    ScheduleGroupEdit,
    '/schedule/101/201',
  );
  expect(wrapper.text()).not.toContain('schedule.selection_identity_pending');
  expect(wrapper.get<HTMLInputElement>('#schedule-title').element.value).toBe(
    'Main Execution Timeline',
  );
  expect(wrapper.get<HTMLInputElement>('#schedule-duration').element.value).toBe('1');
  await wrapper.get('#schedule-title').setValue('Edited timeline');
  expect(wrapper.get<HTMLInputElement>('#schedule-title').element.value).toBe('Edited timeline');
  wrapper.unmount();
  quoteRequest.mockRestore();
});
