import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import SidebarNavigation from '../SidebarNavigation.vue';
import { createPinia, setActivePinia } from 'pinia';

// Mock vue-router
vi.mock('vue-router', () => ({
  useRoute: () => ({
    path: '/employees',
    params: {},
  }),
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock assets
vi.mock('@/assets/images/TechlabLogo.png', () => ({
  default: 'mock-logo.png',
}));

describe('SidebarNavigation.vue', () => {
  const pinia = createPinia();
  setActivePinia(pinia);
  const mountOptions = {
    global: {
      plugins: [pinia],
      stubs: {
        'router-link': {
          template: '<a><slot /></a>',
        },
        SettingIcon: true,
        DocumentIcon: true,
      },
      mocks: {
        $t: (msg: string) => msg,
      },
    },
  };

  it('renders the logo', () => {
    const wrapper = mount(SidebarNavigation, mountOptions);
    const logo = wrapper.find('img.logo');
    expect(logo.exists()).toBe(true);
  });

  it('renders menu groups and items', () => {
    const wrapper = mount(SidebarNavigation, mountOptions);

    // Check for Overview group
    expect(wrapper.text()).toContain('Overview');

    // Check for some menu items
    expect(wrapper.text()).toContain('Employees');
    expect(wrapper.text()).toContain('Documents');
    expect(wrapper.text()).toContain('Countries');
  });

  it('applies active class based on current route', () => {
    const wrapper = mount(SidebarNavigation, mountOptions);

    // According to our mock, path is '/employees'
    const activeLink = wrapper.find('a.active');
    expect(activeLink.exists()).toBe(true);
    expect(activeLink.text()).toContain('Employees');
  });

  it('emits clickItem event when a menu item is clicked', async () => {
    const wrapper = mount(SidebarNavigation, mountOptions);

    const menuItem = wrapper.find('a.menu-item');
    await menuItem.trigger('click');

    expect(wrapper.emitted('clickItem')).toBeTruthy();
  });
});
