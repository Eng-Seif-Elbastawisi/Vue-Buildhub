import PrimeVue from 'primevue/config';
import { flushPromises, mount } from '@vue/test-utils';
import type { Component } from 'vue';
import { createMemoryHistory, createRouter } from 'vue-router';
import { afterEach, vi } from 'vitest';
import ExecutionQuoteApiService from '../../../../data/api/execution.quote.api-service';
import ScheduleController from '../../controllers/schedule.controller';
import ScheduleApiService from '../../../data/api/schedule.api-service';
import {
  overviewResponse,
  timelineResponse,
} from '../../../core/models/__tests__/backend.fixtures';
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  ScheduleController.getInstance().release();
});
export async function mountScheduleRoute(component: Component, path: string) {
  ScheduleController.getInstance().release();
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  );
  const quoteRequest = vi
    .spyOn(ExecutionQuoteApiService.getInstance(), 'show')
    .mockResolvedValue({ statusCode: 200, data: { status: true, data: { id: 101 } } });
  vi.spyOn(ScheduleApiService.getInstance(), 'index').mockResolvedValue({
    statusCode: 200,
    data: overviewResponse(),
  });
  vi.spyOn(ScheduleApiService.getInstance(), 'show').mockResolvedValue({
    statusCode: 200,
    data: { ...timelineResponse(), id: 201 },
  });
  vi.spyOn(ScheduleApiService.getInstance(), 'settings').mockResolvedValue({
    statusCode: 200,
    data: {},
  });
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/schedule/:id/:groupId?', component, name: 'test-schedule' },
      { path: '/quote/:id', name: 'Show Execution Quote', component: { template: '<div />' } },
      { path: '/index/:id', name: 'Quote Schedule', component: { template: '<div />' } },
      { path: '/add/:id', name: 'Add Schedule Group', component: { template: '<div />' } },
    ],
  });
  await router.push(path);
  await router.isReady();
  const wrapper = mount(component, {
    global: {
      plugins: [router, PrimeVue],
      mocks: { $t: (key: string) => key },
      stubs: { ScheduleStageSelector: true, Dialog: { template: '<section><slot /></section>' } },
    },
  });
  await flushPromises();
  return { wrapper, quoteRequest };
}
