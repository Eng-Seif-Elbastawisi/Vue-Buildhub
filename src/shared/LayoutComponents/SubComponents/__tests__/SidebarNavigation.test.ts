import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils';
import { reactive } from 'vue';
import SidebarNavigation from '../SidebarNavigation.vue';
import { createPinia, setActivePinia } from 'pinia';
import UserModel from '@/modules/auth/core/models/user.model';
import { UserType } from '@/modules/auth/core/constants/userType.enum';
import { useUserStore } from '@/stores/user';
import { DATA_MUTATION_SUCCEEDED_EVENT } from '@/base/Presentation/Controller/dataMutationEvent';

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

  it('does not request organization sidebar counts for admin users', async () => {
    const userStore = useUserStore();
    userStore.user = new UserModel({
      id: 1,
      name: 'Admin User',
      email: 'admin@example.com',
      type: UserType.ADMIN,
      WebSocketToken: '',
    });

    mountSidebar();
    await flushPromises();

    expect(sidebarCountsMocks.fetchSidebarCounts).not.toHaveBeenCalled();
  });
});
