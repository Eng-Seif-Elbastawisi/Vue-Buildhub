import { afterEach, expect, it, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createMemoryHistory, createRouter } from 'vue-router';
import { createI18n } from 'vue-i18n';
import PrimeVue from 'primevue/config';
import en from '@/locales/en.json';
import ar from '@/locales/ar.json';
import ShopDrawingsPage from '../ShopDrawingsPage.vue';
import WorkItemsController from '../../controllers/work-items.controller';
import { mockNetwork, response } from '../../../../SiteTeam/__tests__/network';

afterEach(() => {
  WorkItemsController.getInstance().release();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

async function mountPage(path: string, locale = 'en') {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  );

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/:workspace/execution-quotes/show/:id/drawings',
        component: { template: '<div />' },
      },
      { path: '/:pathMatch(.*)*', component: { template: '<div />' } },
    ],
  });
  await router.push(path);
  const i18n = createI18n({ legacy: false, locale, messages: { en: { ...en }, ar: { ...ar } } });
  const wrapper = mount(ShopDrawingsPage, {
    global: {
      plugins: [router, PrimeVue, i18n],
      mocks: { $t: i18n.global.t },
      stubs: {
        Dialog: {
          props: ['visible'],
          template: '<section v-if="visible" role="dialog"><slot /></section>',
        },
      },
    },
  });
  await flushPromises();
  return { router, wrapper };
}

it.each([
  ['organization', 'en'],
  ['mainportal', 'ar'],
])(
  'loads drawings directly with upload and quote isolation in %s/%s',
  async (workspace, locale) => {
    const post = mockNetwork();
    post.mockImplementation(async (request) => {
      if (request.url.includes('fetch_project_timelines'))
        return response({ status: true, data: { basicData: { count_timeline: 0 }, data: [] } });
      const quoteId = Number((request.data as { quote_id: number }).quote_id);
      return response({
        status: true,
        data: [
          {
            id: 1,
            quote_id: quoteId,
            project_id: 86,
            title: `Drawing ${quoteId}`,
            version_number: 'V1',
            date: null,
            file: null,
            custom_number: null,
            employee: null,
            stages: [],
            created_at: null,
          },
        ],
      });
    });
    const { wrapper, router } = await mountPage(
      `/${workspace}/execution-quotes/show/140/drawings`,
      locale,
    );
    const messages = locale === 'ar' ? ar : en;
    expect(wrapper.get('h1').text()).toBe(messages['work_items.drawings']);
    expect(wrapper.get('.workspace-nav [aria-current="page"]').attributes('href')).toBe(
      `/${workspace}/execution-quotes/show/140/drawings`,
    );
    expect(wrapper.get('.work-items-section').attributes('open')).toBeDefined();
    expect(wrapper.get('.work-items-records h3').text()).toBe('Drawing 140');
    expect(wrapper.attributes('dir')).toBe(locale === 'ar' ? 'rtl' : 'ltr');
    expect(
      post.mock.calls
        .filter(([request]) => request.url.includes('fetch_project_timelines'))
        .map(([request]) => request.data),
    ).toEqual([{ quote_id: 140, work_status: 1 }]);
    expect(
      post.mock.calls.filter(([request]) => request.url.includes('fetch_shop_drawing_quotes')),
    ).toHaveLength(1);
    expect(post.mock.calls.filter(([request]) => request.url.includes('show_quote'))).toHaveLength(
      0,
    );
    expect(wrapper.find('.timeline-start-alert').exists()).toBe(false);
    await wrapper.get('.work-items-header button').trigger('click');
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true);
    expect(wrapper.find('#drawing-title').exists()).toBe(true);
    await router.push(`/${workspace}/execution-quotes/show/141/drawings`);
    await flushPromises();
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
    expect(wrapper.get('.work-items-records h3').text()).toBe('Drawing 141');
    expect(wrapper.text()).not.toContain('Drawing 140');
    wrapper.unmount();
  },
);

it('shows the invalid quote message without loading drawings or offering upload', async () => {
  const post = mockNetwork();
  const { wrapper } = await mountPage('/organization/execution-quotes/show/0/drawings');
  expect(wrapper.get('[role="alert"]').text()).toBe(en['work_items.invalid_quote']);
  expect(wrapper.get('.work-items-header button').attributes('disabled')).toBeDefined();
  expect(post).not.toHaveBeenCalled();
  wrapper.unmount();
});
