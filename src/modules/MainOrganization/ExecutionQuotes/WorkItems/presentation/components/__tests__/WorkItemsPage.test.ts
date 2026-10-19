import { afterEach, expect, it, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createMemoryHistory, createRouter } from 'vue-router';
import { createI18n } from 'vue-i18n';
import PrimeVue from 'primevue/config';
import en from '@/locales/en.json';
import ar from '@/locales/ar.json';
import WorkItemsPage from '../WorkItemsPage.vue';
import WorkItemsController from '../../controllers/work-items.controller';
import { mockNetwork, response } from '../../../../SiteTeam/__tests__/network';
afterEach(() => {
  WorkItemsController.getInstance().release();
  vi.restoreAllMocks();
});
it.each(['en', 'ar'])(
  'filters all four types from one collection with Quote navigation in %s',
  async (locale) => {
    const post = mockNetwork();
    post.mockImplementation(async (request) => {
      if (request.url.includes('fetch_project_timelines'))
        return response({ status: true, data: { basicData: { count_timeline: 0 }, data: [] } });
      return response({
        status: true,
        data: request.url.includes('fetch_project_timeline_stage_meetings')
          ? [1, 2, 3, 4].map((type) => ({
              id: type,
              project_timeline_stage_id: 18,
              employee: { id: 1, name: 'Creator', type: 1 },
              title: `Record ${type}`,
              type,
              date: type === 1 ? '2026-10-15' : null,
              description: null,
              assigned_employee: null,
              created_at: null,
            }))
          : [],
      });
    });
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/organization/execution-quotes/show/:id/work-items',
          component: { template: '<div />' },
        },
        { path: '/:pathMatch(.*)*', component: { template: '<div />' } },
      ],
    });
    await router.push('/organization/execution-quotes/show/140/work-items');
    const wrapper = mount(WorkItemsPage, {
      global: {
        plugins: [router, PrimeVue, createI18n({ legacy: false, locale, messages: { en, ar } })],
        stubs: { Dialog: { template: '<div />' } },
      },
    });
    await flushPromises();
    expect(wrapper.findAll('.work-items-records h3').map((title) => title.text())).toEqual([
      'Record 1',
      'Record 2',
      'Record 3',
      'Record 4',
    ]);
    const messages = locale === 'ar' ? ar : en;
    expect(
      wrapper.findAll('.work-items-section').map((section) => section.attributes('aria-label')),
    ).not.toContain(messages['work_items.drawings']);
    expect(wrapper.findAll('button').map((button) => button.text())).not.toContain(
      messages['work_items.new_drawing'],
    );
    expect(
      post.mock.calls.some(([request]) => request.url.includes('fetch_shop_drawing_quotes')),
    ).toBe(false);
    const filters = wrapper.findAll('.work-items-filters button');
    for (let type = 1; type <= 4; type++) {
      await filters[type]?.trigger('click');
      expect(wrapper.findAll('.work-items-records h3').map((title) => title.text())).toEqual([
        `Record ${type}`,
      ]);
    }
    expect(
      post.mock.calls.filter((call) =>
        call[0].url.includes('fetch_project_timeline_stage_meetings'),
      ),
    ).toHaveLength(1);
    expect(
      post.mock.calls.find((call) =>
        call[0].url.includes('fetch_project_timeline_stage_meetings'),
      )?.[0].data,
    ).toEqual({ quote_id: 140 });
    expect(wrapper.findAll('.workspace-nav a').map((link) => link.attributes('href'))).toEqual([
      '/organization/execution-quotes/show/140',
      '/organization/execution-quotes/show/140/intelligence',
      '/organization/execution-quotes/show/140/schedule',
      '/organization/execution-quotes/show/140/site-team',
      '/organization/execution-quotes/show/140/work-items',
      '/organization/execution-quotes/show/140/drawings',
      '/organization/execution-quotes/show/140/procurement',
      '/organization/execution-quotes/show/140/warehouse/material-receipt',
    ]);
    await router.push('/organization/execution-quotes/show/141/work-items');
    await flushPromises();
    expect(
      post.mock.calls
        .filter((call) => call[0].url.includes('fetch_project_timeline_stage_meetings'))
        .at(-1)?.[0].data,
    ).toEqual({ quote_id: 141 });
    expect(wrapper.get('.work-items-filters button').attributes('aria-pressed')).toBe('true');
    wrapper.unmount();
  },
);
