import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MobileSidebarDrawer from '../MobileSidebarDrawer.vue';

vi.mock('vue-router', () => ({
  useRoute: () => ({
    path: '/organization/stages',
  }),
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('MobileSidebarDrawer', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
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
});
