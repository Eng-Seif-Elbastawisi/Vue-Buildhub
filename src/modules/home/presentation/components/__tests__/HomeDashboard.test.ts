import { afterEach, describe, expect, it, vi } from 'vitest';
import { config, flushPromises, mount, type VueWrapper } from '@vue/test-utils';
import type { Ref } from 'vue';
import type { I18n } from 'vue-i18n';
import HomeDashboard from '../HomeDashboard.vue';
import en from '@/locales/en.json';
import ar from '@/locales/ar.json';
import SidebarCountsApiService from '@/shared/LayoutComponents/SubComponents/sidebar.counts.api-service';
import type { SidebarCountsPayload } from '@/shared/LayoutComponents/SubComponents/sidebar.config';
import { DATA_MUTATION_SUCCEEDED_EVENT } from '@/base/Presentation/Controller/dataMutationEvent';

const sidebarResponse = (counts: SidebarCountsPayload) => ({
  statusCode: 200,
  data: { status: true, message: 'ok', data: counts },
});

const mountHome = (workspace: 'admin' | 'organization', locale: 'ar' | 'en' = 'ar') => {
  const i18n = config.global.plugins?.[0] as I18n;
  (i18n.global.locale as Ref<string>).value = locale;
  const messages = locale === 'ar' ? ar : en;
  return mount(HomeDashboard, {
    props: { workspace },
    global: {
      mocks: { $t: (key: string) => (messages as Record<string, string>)[key] ?? key },
      stubs: { RouterLink: { props: ['to'], template: '<a :href="to"><slot /></a>' } },
    },
  });
};

describe('HomeDashboard', () => {
  let wrapper: VueWrapper | undefined;

  afterEach(() => {
    wrapper?.unmount();
    wrapper = undefined;
    vi.restoreAllMocks();
  });

  it('keeps the Organization hero and shows four linked sidebar counts in Arabic', async () => {
    vi.spyOn(SidebarCountsApiService.getInstance(), 'fetchSidebarCounts').mockResolvedValue(
      sidebarResponse({
        projects: { pending_count: 12 },
        clients_count: 24,
        employees_count: 3,
        invoices: { total_count: 7 },
      }),
    );
    wrapper = mountHome('organization');
    await flushPromises();

    expect(wrapper.findAll('.dashboard-home__hero')).toHaveLength(1);
    expect(wrapper.find('.dashboard-home__admin-hero').exists()).toBe(false);
    expect(wrapper.findAll('.dashboard-home__card')).toHaveLength(4);
    expect(wrapper.findAll('.dashboard-home__card-count').map((card) => card.text())).toEqual([
      '١٢',
      '٢٤',
      '٣',
      '٧',
    ]);
    expect(wrapper.findAll('.dashboard-home__card').map((card) => card.attributes('href'))).toEqual(
      [
        '/organization/project',
        '/organization/client',
        '/organization/employee',
        '/organization/invoice',
      ],
    );
  });

  it('shows the Admin ecosystem hero and falls back only for missing counts', async () => {
    const request = vi
      .spyOn(SidebarCountsApiService.getInstance(), 'fetchSidebarCounts')
      .mockResolvedValue(sidebarResponse({ organizations_count: 28, packages_count: 4 }));
    wrapper = mountHome('admin', 'en');
    await flushPromises();

    expect(wrapper.find('.dashboard-home__admin-hero').exists()).toBe(true);
    expect(wrapper.get('.dashboard-home__modules a[href="/admin/organization"]').text()).toBe(
      'Organization',
    );
    expect(wrapper.find('.dashboard-home__modules a[href="/organization/project"]').exists()).toBe(
      false,
    );
    expect(wrapper.find('.dashboard-home__hero').exists()).toBe(false);
    expect(wrapper.findAll('.dashboard-home__card')).toHaveLength(4);
    expect(wrapper.findAll('.dashboard-home__card-count').map((card) => card.text())).toEqual([
      '28',
      '0',
      '4',
      '0',
    ]);
    expect(wrapper.findAll('.dashboard-home__card').map((card) => card.attributes('href'))).toEqual(
      ['/admin/organization', '/admin/admins', '/admin/package', '/admin/package/subscriptions'],
    );
    expect(wrapper.findAll('.dashboard-home__card-icon')).toHaveLength(4);
    expect(wrapper.findAll('.dashboard-home__card-arrow')).toHaveLength(4);
    expect(request).toHaveBeenCalledExactlyOnceWith('admin');
  });

  it('replaces Admin fallback values when the count endpoint returns them after a mutation', async () => {
    const request = vi.spyOn(SidebarCountsApiService.getInstance(), 'fetchSidebarCounts');
    request
      .mockResolvedValueOnce(sidebarResponse({}))
      .mockResolvedValueOnce(sidebarResponse({ admins_count: 6, subscriptions_count: 9 }));
    wrapper = mountHome('admin', 'en');
    await flushPromises();
    expect(wrapper.findAll('.dashboard-home__card-count').map((card) => card.text())).toEqual([
      '0',
      '0',
      '0',
      '0',
    ]);

    window.dispatchEvent(new Event(DATA_MUTATION_SUCCEEDED_EVENT));
    await flushPromises();

    expect(request).toHaveBeenCalledTimes(2);
    expect(wrapper.findAll('.dashboard-home__card-count').map((card) => card.text())).toEqual([
      '0',
      '6',
      '0',
      '9',
    ]);
  });

  it('keeps Admin cards visible if the count endpoint is unavailable', async () => {
    vi.spyOn(SidebarCountsApiService.getInstance(), 'fetchSidebarCounts').mockRejectedValue(
      new Error('endpoint unavailable'),
    );
    wrapper = mountHome('admin', 'en');
    await flushPromises();

    expect(wrapper.findAll('.dashboard-home__card')).toHaveLength(4);
    expect(wrapper.findAll('.dashboard-home__card-count').map((card) => card.text())).toEqual([
      '0',
      '0',
      '0',
      '0',
    ]);
  });

  it('keeps unavailable Organization counts unavailable while showing real zero', async () => {
    vi.spyOn(SidebarCountsApiService.getInstance(), 'fetchSidebarCounts').mockResolvedValue(
      sidebarResponse({ clients_count: 0 }),
    );
    wrapper = mountHome('organization', 'en');
    await flushPromises();

    expect(wrapper.findAll('.dashboard-home__card-count').map((card) => card.text())).toEqual([
      '—',
      '0',
      '—',
      '—',
    ]);
  });
});
