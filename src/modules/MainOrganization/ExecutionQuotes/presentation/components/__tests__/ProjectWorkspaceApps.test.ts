import { flushPromises, mount } from '@vue/test-utils';
import { createMemoryHistory, createRouter } from 'vue-router';
import { createI18n } from 'vue-i18n';
import { createPinia, setActivePinia } from 'pinia';
import { afterEach, expect, it, vi } from 'vitest';
import NetworkService from '@/base/Core/NetworkStructure/networking/networkService';
import en from '@/locales/en.json';
import ar from '@/locales/ar.json';
import ScheduleController from '../../../Schedule/presentation/controllers/schedule.controller';
import ProjectWorkspaceApps from '../ProjectWorkspaceApps.vue';

afterEach(() => {
  ScheduleController.getInstance().release();
  vi.restoreAllMocks();
});
it.each(['en', 'ar'])(
  'launches only available apps with actual summary data in %s',
  async (locale) => {
    const pinia = createPinia();
    setActivePinia(pinia);
    vi.spyOn(NetworkService.instance, 'post').mockResolvedValue({
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as never,
      data: {
        status: true,
        data: {
          basicData: { start_date: '2026-10-10', status: null, count_timeline: 0 },
          data: [],
        },
      },
    });
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/:pathMatch(.*)*', component: { template: '<div />' } }],
    });
    await router.push('/organization/execution-quotes/show/140');
    const wrapper = mount(ProjectWorkspaceApps, {
      props: { quoteId: 140 },
      global: {
        plugins: [pinia, router, createI18n({ legacy: false, locale, messages: { en, ar } })],
      },
    });
    await flushPromises();
    const links = wrapper.findAll('.project-shortcut');
    expect(links.map((link) => link.attributes('href'))).toEqual([
      '/organization/execution-quotes/show/140/intelligence',
      '/organization/execution-quotes/show/140/schedule',
      '/organization/execution-quotes/show/140/site-team',
      '/organization/execution-quotes/show/140/work-items',
      '/organization/execution-quotes/show/140/procurement',
      '/organization/execution-quotes/show/140/warehouse/material-receipt',
    ]);
    expect(
      wrapper
        .get('.schedule-shortcuts .project-shortcut')
        .findAll('dd')
        .map((cell) => cell.text()),
    ).toContain('0');
    expect(wrapper.findAll('.schedule-shortcuts h2')).toHaveLength(0);
    expect(wrapper.get('.workspace-apps__grid > .project-shortcut').findAll('dd')).toHaveLength(0);
    await wrapper.get('a[href$="/site-team"]').trigger('click');
    await flushPromises();
    expect(router.currentRoute.value.path).toBe(
      '/organization/execution-quotes/show/140/site-team',
    );
    wrapper.unmount();
  },
);
