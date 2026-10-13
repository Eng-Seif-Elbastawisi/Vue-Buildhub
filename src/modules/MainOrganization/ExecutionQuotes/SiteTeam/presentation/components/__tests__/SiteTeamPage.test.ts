import { afterEach, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { createMemoryHistory, createRouter } from 'vue-router';
import { createI18n } from 'vue-i18n';
import PrimeVue from 'primevue/config';
import SiteTeamPage from '../SiteTeamPage.vue';
import { mockNetwork, response } from '../../../__tests__/network';
import en from '@/locales/en.json';
import ar from '@/locales/ar.json';
afterEach(() => vi.unstubAllGlobals());
it.each(['en', 'ar'])(
  'renders real floor hierarchy and team in %s with the proper reading direction',
  async (locale) => {
    const post = mockNetwork();
    post.mockImplementation(async (request) => {
      if (request.url.includes('show_quote'))
        return response({ status: true, data: { id: 140, project: { id: 43, title: 'Project' } } });
      if (request.url.includes('fetch_project_floors'))
        return response({
          status: true,
          data: [
            {
              id: 23,
              floor_number: 0,
              spaces: [
                {
                  id: 1,
                  space: { id: 13, title: 'Living room' },
                  length: 6,
                  width: 4,
                  height: 3.2,
                  notes: 'Site note',
                },
              ],
            },
          ],
        });
      if (request.url.includes('fetch_quote_engineers'))
        return response({ status: true, employee: [{ id: 7, name: 'Engineer A' }] });
      return response({
        status: true,
        data: { delivery_date: '2026-12-01', site_condition: 'Ready' },
      });
    });
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/organization/execution-quotes/show/:id/site-team', component: SiteTeamPage },
      ],
    });
    await router.push('/organization/execution-quotes/show/140/site-team');
    const wrapper = mount(SiteTeamPage, {
      global: {
        plugins: [router, PrimeVue, createI18n({ legacy: false, locale, messages: { en, ar } })],
      },
    });
    await flushPromises();
    expect(wrapper.attributes('dir')).toBe(locale === 'ar' ? 'rtl' : 'ltr');
    expect(wrapper.text()).toContain('Engineer A');
    expect(wrapper.text()).toContain('Living room');
    expect(wrapper.text()).toContain('Site note');
    expect(wrapper.find('a[href="/organization/execution-quotes/show/140"]').exists()).toBe(true);
    wrapper.unmount();
  },
);
