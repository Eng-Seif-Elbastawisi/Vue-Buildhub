import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import { createI18n } from 'vue-i18n';
import PrimeVue from 'primevue/config';
import en from '@/locales/en.json';
import ar from '@/locales/ar.json';
import DashboardLayout from '@/shared/LayoutComponents/DashboardLayout.vue';
import TimelineStartRequiredAlert from '../../../shared/components/TimelineStartRequiredAlert.vue';
import { mockNetwork, response } from '../../../SiteTeam/__tests__/network';
import { timelineGroup } from '../../../Procurement/__tests__/fixtures';
import ScheduleController from '../../../Schedule/presentation/controllers/schedule.controller';
let post: ReturnType<typeof mockNetwork>;
beforeEach(() => {
  post = mockNetwork();
  ScheduleController.getInstance().release();
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  );
});
afterEach(() => vi.unstubAllGlobals());
it.each(['organization', 'mainportal'])(
  'keeps one fixed icon across all %s execution quote Show pages without background requests',
  async (portal) => {
    post.mockImplementation(async (request) =>
      response(
        request.url.includes('fetch_project_timelines')
          ? {
              status: true,
              data: {
                basicData: { count_timeline: 1 },
                data: [{ ...timelineGroup(), work_status: 1 }],
              },
            }
          : { status: true, data: { id: 140, timeline_status: 3 } },
      ),
    );
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/:pathMatch(.*)*', component: { template: '<div />' } }],
    });
    await router.push(`/${portal}/execution-quotes/show/140`);
    const wrapper = mount(DashboardLayout, {
      attachTo: document.body,
      global: {
        plugins: [
          router,
          PrimeVue,
          createI18n({
            legacy: false,
            locale: 'en',
            flatJson: true,
            messages: { en: { ...en }, ar: { ...ar } },
          }),
        ],
        stubs: {
          SidebarNavigation: true,
          Navbar: true,
          FeatureHeader: true,
          AnimatedBreadcrumb: true,
          MobileTopBar: true,
          MobileSidebarDrawer: true,
          Teleport: true,
        },
      },
    });
    for (const suffix of [
      '',
      '/work-items',
      '/drawings',
      '/procurement',
      '/procurement/purchase-requests/add',
      '/procurement/purchase-requests/6/supplier-prices',
      '/warehouse/material-receipt',
      '/warehouse/material-disbursement',
      '/site-team',
      '/schedule',
      '/schedule/add',
      '/schedule/2',
      '/schedule/2/edit',
    ]) {
      await router.push(`/${portal}/execution-quotes/show/140${suffix}`);
      await flushPromises();
      expect(wrapper.findAllComponents(TimelineStartRequiredAlert)).toHaveLength(1);
      expect(wrapper.findAll('.timeline-widget__trigger')).toHaveLength(1);
      expect(wrapper.find('.timeline-start-alert').exists()).toBe(false);
    }
    expect(post).not.toHaveBeenCalled();
    await router.push(`/${portal}/execution-quotes/show/140/work-items`);
    await wrapper.get('.timeline-widget__trigger').trigger('click');
    await flushPromises();
    expect(wrapper.findAll('[data-group-id]')).toHaveLength(1);
    expect(
      post.mock.calls.filter(([request]) => request.url.includes('fetch_project_timelines')),
    ).toHaveLength(1);
    expect(
      post.mock.calls.find(([request]) => request.url.includes('fetch_project_timelines'))?.[0]
        .data,
    ).toEqual({ quote_id: 140 });
    await router.push(`/${portal}/execution-quotes/show/141/work-items`);
    expect(wrapper.getComponent(TimelineStartRequiredAlert).props('quoteId')).toBe(141);
    expect(wrapper.find('.timeline-start-alert').exists()).toBe(false);
    await router.push(`/${portal}/execution-quotes`);
    expect(wrapper.findComponent(TimelineStartRequiredAlert).exists()).toBe(false);
    wrapper.unmount();
  },
);
