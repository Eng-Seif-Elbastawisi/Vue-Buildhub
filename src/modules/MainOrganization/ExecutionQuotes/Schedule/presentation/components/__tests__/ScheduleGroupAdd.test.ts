import { expect, it } from 'vitest';
import ScheduleGroupAdd from '../ScheduleGroupAdd.vue';
import { mountScheduleRoute } from './routeHarness';
it('loads add on direct navigation without relying on an earlier Index visit', async () => {
  const { wrapper, quoteRequest } = await mountScheduleRoute(ScheduleGroupAdd, '/schedule/101');
  expect(wrapper.find('form').exists()).toBe(true);
  expect(wrapper.find('.standard-crud-page .document-form-card .form-fields').exists()).toBe(true);
  expect(wrapper.find('.input-wrapper input.input').exists()).toBe(true);
  expect(wrapper.find('button[type="submit"].btn-primary').exists()).toBe(true);
  expect(wrapper.find('h1').exists()).toBe(false);
  wrapper.unmount();
  quoteRequest.mockRestore();
});
