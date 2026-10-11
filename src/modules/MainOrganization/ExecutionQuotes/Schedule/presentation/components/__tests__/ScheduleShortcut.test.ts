import { flushPromises, mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import { afterEach, expect, it, vi } from 'vitest';
import {
  DataSuccess,
  DataFailed,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import ScheduleShortcut from '../ScheduleShortcut.vue';
import ScheduleController from '../../controllers/schedule.controller';
import ScheduleRepository from '../../../data/repositories/schedule.repository';
import ProjectTimelineOverviewModel from '../../../core/models/project.timeline.overview.model';
import { overviewResponse } from '../../../core/models/__tests__/backend.fixtures';
afterEach(() => {
  vi.restoreAllMocks();
  ScheduleController.getInstance().release();
});
it('uses a cached owner-safe overview and navigates to the same Quote in mainportal', async () => {
  const controller = ScheduleController.getInstance();
  controller.release();
  controller.activate(140);
  controller.overviewState.value = new DataSuccess({
    data: ProjectTimelineOverviewModel.fromJson(overviewResponse().data),
  });
  const read = vi.spyOn(ScheduleRepository.getInstance(), 'readOverview');
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/mainportal/execution-quotes/show/:id', component: { template: '<div />' } },
      {
        path: '/mainportal/execution-quotes/show/:id/schedule',
        component: { template: '<div />' },
      },
    ],
  });
  await router.push('/mainportal/execution-quotes/show/140');
  const wrapper = mount(ScheduleShortcut, {
    props: { quoteId: 140 },
    global: { plugins: [router], mocks: { $t: (key: string) => key } },
  });
  await flushPromises();
  expect(read).not.toHaveBeenCalled();
  expect(wrapper.get('a').attributes('href')).toBe(
    '/mainportal/execution-quotes/show/140/schedule',
  );
  expect(wrapper.text()).toContain('2026-10-10');
  expect(wrapper.text()).toContain('schedule.not_available');
  await wrapper.get('a').trigger('click');
  await flushPromises();
  expect(router.currentRoute.value.path).toBe('/mainportal/execution-quotes/show/140/schedule');
  wrapper.unmount();
});
it('shows loading then error without manufacturing metrics', async () => {
  ScheduleController.getInstance().release();
  let finish!: (state: DataFailed<ProjectTimelineOverviewModel>) => void;
  vi.spyOn(ScheduleRepository.getInstance(), 'readOverview').mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: { template: '<div />' } }],
  });
  const wrapper = mount(ScheduleShortcut, {
    props: { quoteId: 140 },
    global: {
      plugins: [router],
      mocks: { $t: (key: string) => key },
      stubs: { RouterLink: { template: '<a><slot /></a>' } },
    },
  });
  expect(wrapper.text()).toContain('schedule.loading');
  finish(new DataFailed({}));
  await flushPromises();
  expect(wrapper.find('dl').exists()).toBe(false);
  wrapper.unmount();
});
