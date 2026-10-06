import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils';
import { nextTick, reactive } from 'vue';
import SidebarNavigation from '../SidebarNavigation.vue';
import { createPinia, setActivePinia } from 'pinia';
import UserModel from '@/modules/auth/core/models/user.model';
import { UserType } from '@/modules/auth/core/constants/userType.enum';
import { useUserStore } from '@/stores/user';
import { DATA_MUTATION_SUCCEEDED_EVENT } from '@/base/Presentation/Controller/dataMutationEvent';
import { useSystemIdentityTheme } from '@/modules/shared/SystemIdentity/presentation/composables/useSystemIdentityTheme';

const routerMocks = vi.hoisted(() => ({
  push: vi.fn(),
  useRoute: vi.fn(),
}));

const sidebarCountsMocks = vi.hoisted(() => ({
  fetchSidebarCounts: vi.fn(),
}));

// Mock vue-router
vi.mock('vue-router', () => ({
  useRoute: routerMocks.useRoute,
  useRouter: () => ({
    push: routerMocks.push,
  }),
}));

vi.mock('../sidebar.counts.api-service', () => ({
  default: {
    getInstance: () => ({
      fetchSidebarCounts: sidebarCountsMocks.fetchSidebarCounts,
    }),
  },
}));

// Mock assets
vi.mock('@/assets/images/TechlabLogo.png', () => ({
  default: 'mock-logo.png',
}));

describe('SidebarNavigation.vue', () => {
  let wrapper: VueWrapper | null = null;
  let pinia: ReturnType<typeof createPinia>;

  const mountSidebar = () => {
    wrapper = mount(SidebarNavigation, {
      global: {
        plugins: [pinia],
        stubs: {
          'router-link': {
            template: '<a v-bind="$attrs"><slot /></a>',
          },
          SettingIcon: true,
          DocumentIcon: true,
        },
        mocks: {
          $t: (msg: string) => msg,
        },
      },
    });

    return wrapper;
  };

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    routerMocks.useRoute.mockReturnValue(
      reactive({
        path: '/organization/stages',
        fullPath: '/organization/stages',
        params: {},
        query: {},
      }),
    );
    sidebarCountsMocks.fetchSidebarCounts.mockReset();
    sidebarCountsMocks.fetchSidebarCounts.mockResolvedValue({
      data: {
        data: {},
      },
    });
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
  });

  it('renders the logo', () => {
    const wrapper = mountSidebar();
    const logo = wrapper.find('img.logo');
    expect(logo.exists()).toBe(true);
  });

  it('updates the sidebar logo when system identity changes during the session', async () => {
    const userStore = useUserStore();
    userStore.setUser(
      new UserModel({
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        WebSocketToken: '',
        setting: {
          logo: 'https://assets.test/original-logo.webp',
          primary_color: '#123456',
          secondary_color: '#101418',
          accent_color: '#ABCDEF',
        },
      }),
    );
    const wrapper = mountSidebar();
    const theme = useSystemIdentityTheme();

    theme.applyPalette({
      ...theme.currentPalette.value,
      logo: 'https://assets.test/updated-logo.webp',
    });
    await nextTick();

    expect(wrapper.get('img.logo').attributes('src')).toBe('https://assets.test/updated-logo.webp');
  });

  it('renders menu groups and items', () => {
    const wrapper = mountSidebar();

    expect(wrapper.text()).toContain('sidebar.sys_config');
    expect(wrapper.text()).toContain('sidebar.construction_config');
    expect(wrapper.text()).toContain('sidebar.stages');
    expect(wrapper.text()).toContain('sidebar.client_source');
  });

  it('applies active class based on current route', () => {
    const wrapper = mountSidebar();

    const activeLink = wrapper.find('a.active');
    expect(activeLink.exists()).toBe(true);
    expect(activeLink.text()).toContain('sidebar.stages');
  });

  it('selects and highlights the execution quotes section for its add route', () => {
    routerMocks.useRoute.mockReturnValue(
      reactive({
        path: '/organization/execution-quotes/add',
        fullPath: '/organization/execution-quotes/add',
        params: {},
        query: {},
      }),
    );

    const wrapper = mountSidebar();
    const activeSection = wrapper.get('.section-toggle.active');
    const activeLinkLabels = wrapper.findAll('a.menu-item.active').map((link) => link.text());

    expect(activeSection.attributes('title')).toBe('sidebar.execution-quotes');
    expect(activeSection.find('.pi-calculator').exists()).toBe(true);
    expect(activeLinkLabels).toContain('sidebar.add-execution-quote');
    expect(wrapper.get('a.menu-item.active').find('.item-icon').exists()).toBe(false);
  });

  it('starts with the shared navigation pane open across dashboard routes', async () => {
    const route = reactive({
      name: 'Execution Quotes',
      path: '/organization/execution-quotes',
      fullPath: '/organization/execution-quotes',
      params: {},
      query: {},
    });
    routerMocks.useRoute.mockReturnValue(route);

    const wrapper = mountSidebar();

    expect(wrapper.get('.sidebar-shell').classes()).toContain('is-open');
    expect(wrapper.get('.section-toggle.active').attributes('title')).toBe(
      'sidebar.execution-quotes',
    );
    expect(wrapper.find('.sidebar-rail').exists()).toBe(false);

    route.name = 'Other Route';
    await nextTick();

    expect(wrapper.get('.sidebar-shell').classes()).toContain('is-open');
  });

  it('expands nested items and collapses the single sidebar', async () => {
    const wrapper = mountSidebar();
    const executionQuotesButton = wrapper.get('.section-toggle[title="sidebar.execution-quotes"]');

    expect(wrapper.get('.sidebar-shell').classes()).toContain('is-open');
    expect(executionQuotesButton.attributes('aria-expanded')).toBe('false');

    await executionQuotesButton.trigger('click');
    expect(executionQuotesButton.attributes('aria-expanded')).toBe('true');
    expect(wrapper.get('#sidebar-section-execution-quotes').isVisible()).toBe(true);

    await executionQuotesButton.trigger('click');
    expect(executionQuotesButton.attributes('aria-expanded')).toBe('false');
    expect(wrapper.find('#sidebar-section-execution-quotes').exists()).toBe(false);

    await wrapper.get('.collapse-toggle').trigger('click');
    expect(wrapper.get('.sidebar-shell').classes()).not.toContain('is-open');
    expect(wrapper.get('.collapse-toggle').attributes('aria-label')).toBe('expand_sidebar');

    await wrapper.get('.collapse-toggle').trigger('click');
    expect(wrapper.get('.sidebar-shell').classes()).toContain('is-open');
  });

  it('removes the extra top spacing before the execution offers group', async () => {
    const wrapper = mountSidebar();

    await wrapper.get('.section-toggle[title="sidebar.design_offers"]').trigger('click');

    const executionOffersGroup = wrapper.get('.menu-subgroup[title="sidebar.execution_offers"]');

    expect(executionOffersGroup.classes()).toContain('menu-subgroup--flush-top');
    expect(executionOffersGroup.find('.menu-subgroup__icon').exists()).toBe(false);
  });

  it('emits clickItem event when a menu item is clicked', async () => {
    const wrapper = mountSidebar();

    const menuItem = wrapper.find('a.menu-item');
    await menuItem.trigger('click');

    expect(wrapper.emitted('clickItem')).toBeTruthy();
  });

  it('reloads badge counts after a successful same-page form mutation', async () => {
    // Regression: inline department saves do not navigate to another route.
    const userStore = useUserStore();
    userStore.user = new UserModel({
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      WebSocketToken: '',
    });
    sidebarCountsMocks.fetchSidebarCounts
      .mockResolvedValueOnce({
        data: {
          data: {
            departments: { design_count: 1 },
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          data: {
            departments: { design_count: 2 },
          },
        },
      });

    const wrapper = mountSidebar();
    await flushPromises();

    expect(sidebarCountsMocks.fetchSidebarCounts).toHaveBeenCalledTimes(1);
    expect(wrapper.findAll('.badge').some((badge) => badge.text() === '1')).toBe(true);

    window.dispatchEvent(new Event(DATA_MUTATION_SUCCEEDED_EVENT));
    await flushPromises();

    expect(sidebarCountsMocks.fetchSidebarCounts).toHaveBeenCalledTimes(2);
    expect(wrapper.findAll('.badge').some((badge) => badge.text() === '2')).toBe(true);
  });

  it('loads and refreshes admin sidebar badges', async () => {
    const userStore = useUserStore();
    userStore.user = new UserModel({
      id: 1,
      name: 'Admin User',
      email: 'admin@example.com',
      type: UserType.ADMIN,
      WebSocketToken: '',
    });
    sidebarCountsMocks.fetchSidebarCounts
      .mockResolvedValueOnce({ data: { data: { packages_count: 4 } } })
      .mockResolvedValueOnce({ data: { data: { packages_count: 5 } } });

    const wrapper = mountSidebar();
    await flushPromises();

    expect(sidebarCountsMocks.fetchSidebarCounts).toHaveBeenCalledWith('admin');
    expect(wrapper.findAll('.badge').some((badge) => badge.text() === '4')).toBe(true);

    window.dispatchEvent(new Event(DATA_MUTATION_SUCCEEDED_EVENT));
    await flushPromises();

    expect(sidebarCountsMocks.fetchSidebarCounts).toHaveBeenCalledTimes(2);
    expect(wrapper.findAll('.badge').some((badge) => badge.text() === '5')).toBe(true);
  });

  it('shows the Organization Contractor count beside its existing menu link', async () => {
    routerMocks.useRoute.mockReturnValue(
      reactive({
        path: '/organization/contractors',
        fullPath: '/organization/contractors',
        params: {},
        query: {},
      }),
    );
    const userStore = useUserStore();
    userStore.user = new UserModel({
      id: 1,
      name: 'Organization User',
      email: 'test@example.com',
      WebSocketToken: '',
    });
    sidebarCountsMocks.fetchSidebarCounts.mockResolvedValue({
      data: { data: { contractors_count: 7 } },
    });

    const wrapper = mountSidebar();
    await flushPromises();

    expect(sidebarCountsMocks.fetchSidebarCounts).toHaveBeenCalledWith('organization');
    expect(wrapper.get('a.menu-item[title="sidebar.contractors"] .badge').text()).toBe('7');
  });

  it('shows Admin counts beside their matching links and omits missing badges', async () => {
    routerMocks.useRoute.mockReturnValue(
      reactive({
        path: '/admin/organization',
        fullPath: '/admin/organization',
        params: {},
        query: {},
      }),
    );
    const userStore = useUserStore();
    userStore.user = new UserModel({
      id: 1,
      name: 'Admin User',
      email: 'admin@example.com',
      type: UserType.ADMIN,
      WebSocketToken: '',
    });
    sidebarCountsMocks.fetchSidebarCounts.mockResolvedValue({
      data: {
        data: {
          packages_count: 4,
          subscriptions_count: 3,
          organizations_count: 2,
        },
      },
    });

    const wrapper = mountSidebar();
    await flushPromises();

    const systemSection = wrapper.get('.section-toggle[title="sidebar.sys_config"]');
    await systemSection.trigger('click');
    expect(wrapper.get('a.menu-item[title="sidebar.packages"] .badge').text()).toBe('4');
    expect(wrapper.get('a.menu-item[title="package.subscriptions"] .badge').text()).toBe('3');

    await wrapper.get('.section-toggle[title="sidebar.organization"]').trigger('click');
    expect(wrapper.get('a.menu-item[title="sidebar.organization"] .badge').text()).toBe('2');
    expect(wrapper.find('a.menu-item[title="sidebar.admins"] .badge').exists()).toBe(false);
    expect(wrapper.get('a.menu-item[title="sidebar.admins"]').exists()).toBe(true);
  });
});
