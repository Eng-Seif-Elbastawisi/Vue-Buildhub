import { afterEach, expect, it, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import { createRouter, createMemoryHistory } from 'vue-router';
import PrimeVue from 'primevue/config';
import ProcurementPage from '../ProcurementPage.vue';
import PurchaseRequestController from '../../controllers/purchase-request.controller';
import { mockNetwork, response } from '../../../../SiteTeam/__tests__/network';
import { requestRecord, overviewRecord } from '../../../__tests__/fixtures';
import en from '@/locales/en.json';
import ar from '@/locales/ar.json';
afterEach(() => {
  PurchaseRequestController.getInstance().release();
  vi.unstubAllGlobals();
});
it.each(['en', 'ar'])(
  'renders real requirements, confirmed status labels and read-only details in %s',
  async (locale) => {
    const post = mockNetwork();
    post.mockImplementation(async (request) =>
      response(
        request.url.includes('fetch_purchase_requests')
          ? {
              status: true,
              data: [1, 2, 3].map((status) => ({ ...requestRecord(), id: status, status })),
            }
          : request.url.includes('fetch_project_timelines')
            ? overviewRecord()
            : { status: true, data: { id: 140 } },
      ),
    );
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/organization/execution-quotes/show/:id/procurement',
          component: { template: '<div />' },
        },
      ],
    });
    await router.push('/organization/execution-quotes/show/140/procurement');
    const localization = createI18n({ legacy: false, locale, messages: { en, ar } });
    const wrapper = mount(ProcurementPage, {
      global: {
        plugins: [router, PrimeVue, localization],
        mocks: { $t: localization.global.t },
        stubs: { Dialog: { template: '<section><slot /></section>' } },
      },
    });
    await flushPromises();
    expect(wrapper.findAll('.procurement-status').map((badge) => badge.text())).toEqual(
      locale === 'en' ? ['Pending', 'Rejected', 'Confirmed'] : ['قيد الانتظار', 'مرفوض', 'مؤكد'],
    );
    expect(wrapper.text()).toContain('Responsible Employee');
    expect(wrapper.text()).not.toContain('procurement.');
    const view = wrapper.get('[aria-controls="requirement-details-1"]');
    await view.trigger('click');
    expect(view.attributes('aria-expanded')).toBe('true');
    expect(wrapper.get('#requirement-details-1').text()).toContain('10.00');
    expect(wrapper.get('#requirement-details-1').findAll('button')).toHaveLength(0);
    expect(wrapper.get('.workspace-nav [aria-current="page"]').attributes('href')).toContain(
      '/140/procurement',
    );
    wrapper.unmount();
  },
);
it('closes creation and clears old requests when the Quote changes', async () => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  );
  const post = mockNetwork();
  post.mockImplementation(async (request) =>
    response(
      request.url.includes('fetch_purchase_requests')
        ? { status: true, data: request.data?.quote_id === 140 ? [requestRecord()] : [] }
        : request.url.includes('fetch_project_timelines')
          ? overviewRecord()
          : request.url.includes('show_quote')
            ? { status: true, data: { id: request.data?.quote_id } }
            : { status: true, data: [] },
    ),
  );
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/organization/execution-quotes/show/:id/procurement',
        component: { template: '<div />' },
      },
    ],
  });
  await router.push('/organization/execution-quotes/show/140/procurement');
  const wrapper = mount(ProcurementPage, {
    global: {
      plugins: [
        router,
        PrimeVue,
        createI18n({ legacy: false, locale: 'en', messages: { en, ar } }),
      ],
      stubs: { Dialog: { template: '<section><slot /></section>' } },
    },
  });
  await flushPromises();
  await wrapper.get('.procurement-header button').trigger('click');
  expect(wrapper.find('form').exists()).toBe(true);
  await router.push('/organization/execution-quotes/show/141/procurement');
  await flushPromises();
  expect(wrapper.find('form').exists()).toBe(false);
  expect(wrapper.text()).not.toContain('Responsible Employee');
  expect(wrapper.text()).toContain('No purchase requirements yet');
  wrapper.unmount();
});
