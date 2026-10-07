import { expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useUserStore } from '@/stores/user';
import { ScheduleEndpoints } from '../schedule.api.endpoints';
it('resolves the current organization/mainportal prefix without capturing the old user', () => {
  setActivePinia(createPinia());
  const endpoints = new ScheduleEndpoints();
  expect(endpoints.sort).toContain('/organization/change_projecttimeline_order');
  const store = useUserStore();
  store.$patch({ user: { ...store.user, type: 1 } });
  expect(endpoints.sort).toContain('/mainportal/change_projecttimeline_order');
});
