import { flushPromises, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MobileSidebarDrawer from '../MobileSidebarDrawer.vue';
import UserModel from '@/modules/auth/core/models/user.model';
import { UserType } from '@/modules/auth/core/constants/userType.enum';
import { useUserStore } from '@/stores/user';

const sidebarCountsMocks = vi.hoisted(() => ({
  fetchSidebarCounts: vi.fn(),
}));

vi.mock('vue-router', () => ({
  useRoute: () => ({
    path: '/organization/stages',
  }),
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('../sidebar.counts.api-service', () => ({
  default: {
    getInstance: () => ({
      fetchSidebarCounts: sidebarCountsMocks.fetchSidebarCounts,
    }),
  },
}));

describe('MobileSidebarDrawer', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    sidebarCountsMocks.fetchSidebarCounts.mockReset();
  });

  it('renders grouped navigation when open', () => {
    const wrapper = mount(MobileSidebarDrawer, {
      props: {
        open: true,
      },
      global: {
        mocks: {
          $t: (key: string) => key,
        },
        stubs: {
          Teleport: true,
          RouterLink: {
            template: '<a :href="to"><slot /></a>',
            props: ['to'],
          },
        },
      },
    });

    expect(wrapper.text()).toContain('sidebar.crm');
    expect(wrapper.text()).toContain('sidebar.stages');
    expect(wrapper.findAll('.drawer-section').length).toBeGreaterThan(1);
    expect(wrapper.find('.drawer-section-header').exists()).toBe(true);
    expect(wrapper.find('.drawer-subgroup').exists()).toBe(true);
    expect(wrapper.find('.drawer-item.is-disabled').exists()).toBe(true);
    expect(
      wrapper.findAll('a').every((link) => !link.attributes('href')?.includes('undefined')),
    ).toBe(true);
  });

  it('closes when the backdrop is clicked', async () => {
    const wrapper = mount(MobileSidebarDrawer, {
      props: {
        open: true,
      },
      global: {
        mocks: {
          $t: (key: string) => key,
        },
        stubs: {
          Teleport: true,
          RouterLink: true,
        },
      },
    });

    await wrapper.find('.mobile-sidebar-layer').trigger('click');

    expect(wrapper.emitted('update:open')?.[0]).toEqual([false]);
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

    mount(MobileSidebarDrawer, {
      props: {
        open: true,
      },
      global: {
        mocks: {
          $t: (key: string) => key,
        },
        stubs: {
          Teleport: true,
          RouterLink: true,
        },
      },
    });
    await flushPromises();

    expect(sidebarCountsMocks.fetchSidebarCounts).not.toHaveBeenCalled();
  });
});
