import { flushPromises, mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import { createMemoryHistory, createRouter } from 'vue-router';
import PrimeVue from 'primevue/config';
import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { useUserStore } from '@/stores/user';
import UserModel from '@/modules/auth/core/models/user.model';
import en from '@/locales/en.json';
import ar from '@/locales/ar.json';
import { mockNetwork } from '../../../../SiteTeam/__tests__/network';
import { sourceResponse } from '../../../__tests__/fixtures';
import AnalyticsController from '../../controllers/analytics.controller';
import ProjectIntelligenceDashboard from '../ProjectIntelligenceDashboard.vue';
import AnalyticsKpiCard from '../AnalyticsKpiCard.vue';
beforeEach(() => {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  }));
});
async function dashboard(locale = 'en', internal = true) {
  const network = mockNetwork();
  network.mockImplementation(async (request) => sourceResponse(request.url));
  const store = useUserStore();
  if (internal)
    store.user = new UserModel({
      name: 'Team',
      email: 'team@example.test',
      type: 2,
      WebSocketToken: '',
    });
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/organization/execution-quotes/show/:id/intelligence',
        component: { template: '<div />' },
      },
    ],
  });
  await router.push('/organization/execution-quotes/show/140/intelligence');
  const i18n = createI18n({ legacy: false, locale, messages: { en, ar } });
  const wrapper = mount(ProjectIntelligenceDashboard, {
    global: {
      mocks: { $t: i18n.global.t },
      plugins: [router, PrimeVue, createI18n({ legacy: false, locale, messages: { en, ar } })],
    },
  });
  await flushPromises();
  return { wrapper, network, router };
}
afterEach(() => {
  AnalyticsController.getInstance().release();
  vi.restoreAllMocks();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
it.each(['en', 'ar'])('renders honest evidence and same-Quote drilldowns in %s', async (locale) => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-10-19T22:00:00Z'));
  const { wrapper, network } = await dashboard(locale);
  expect(wrapper.attributes('dir')).toBe(locale === 'ar' ? 'rtl' : 'ltr');
  expect(wrapper.text()).toContain('Courtyard');
  expect(
    wrapper.findAllComponents(AnalyticsKpiCard).map((card) => card.get('strong').text()),
  ).toEqual([
    locale === 'ar' ? 'تعليق' : 'HOLD',
    '2 / 5',
    '1',
    '1',
    '1',
    '1 / 1',
    locale === 'ar' ? ar.intelligence.unavailable : en.intelligence.unavailable,
    '1',
  ]);
  expect(wrapper.text()).toContain(
    locale === 'ar' ? ar.intelligence.final_authority : en.intelligence.final_authority,
  );
  expect(
    wrapper.findAll('a[href]').every((link) => link.attributes('href')?.includes('/show/140')),
  ).toBe(true);
  expect(wrapper.findAll('.analytics-charts > article')).toHaveLength(6);
  expect(wrapper.get('input[type="checkbox"]').exists()).toBe(true);
  await wrapper.get('input[type="checkbox"]').setValue(true);
  expect(wrapper.findAll('.status-chart--flat')).toHaveLength(4);
  const calls = network.mock.calls.length;
  await wrapper.get('button.btn-primary').trigger('click');
  await flushPromises();
  expect(network.mock.calls.length).toBe(calls + 8);
  wrapper.unmount();
});
it('withholds dashboard and makes no reads for users outside internal workspace roles', async () => {
  const { wrapper, network } = await dashboard('en', false);
  expect(wrapper.text()).toContain(en.intelligence.not_permitted);
  expect(wrapper.find('.analytics-kpis').exists()).toBe(false);
  expect(network).not.toHaveBeenCalled();
  wrapper.unmount();
});
