import { beforeEach, describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import Navbar from '../Navbar.vue';

const mockLocale = vi.hoisted(() => ({ value: 'ar' }));

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    locale: mockLocale,
  }),
}));

// ── Stores ────────────────────────────────────────────────────────────────────
vi.mock('@/stores/user', () => ({
  useUserStore: () => ({
    logout: vi.fn(),
    user: { name: 'Test User', isMaster: true, type: 1 },
  }),
}));

vi.mock('@/stores/theme', () => ({
  useThemeStore: () => ({
    toggle: vi.fn(),
  }),
}));

// ── Router ────────────────────────────────────────────────────────────────────
const mockPush = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

// ── Assets ────────────────────────────────────────────────────────────────────
vi.mock('@/assets/images/headerIMages/employee.jpg', () => ({
  default: 'mock-employee.jpg',
}));

describe('Navbar.vue', () => {
  beforeEach(() => {
    mockLocale.value = 'ar';
    localStorage.clear();
    document.documentElement.removeAttribute('lang');
    document.documentElement.removeAttribute('dir');
    document.body.removeAttribute('dir');
    mockPush.mockClear();
  });

  const mountOptions = {
    global: {
      mocks: {
        $t: (msg: string) => msg,
      },
      stubs: {
        SearchIcon: true,
        HeaderSettingIcon: true,
        HeaderDarkModeIcon: true,
        HeaderMessgaesIcon: true,
        HeaderNotificationIcon: true,
        HeaderSidebarIcon: true,
        IconLogout: true,
        SidebarNavigation: true,
        Drawer: {
          template: '<div class="drawer-stub"><slot /><slot name="header" /></div>',
          props: ['visible', 'position'],
        },
      },
    },
  };

  it('renders the header element', () => {
    const wrapper = mount(Navbar, mountOptions);
    expect(wrapper.find('header.header').exists()).toBe(true);
  });

  it('renders the nav element', () => {
    const wrapper = mount(Navbar, mountOptions);
    expect(wrapper.find('nav.nav').exists()).toBe(true);
  });

  it('renders the user avatar image', () => {
    const wrapper = mount(Navbar, mountOptions);
    expect(wrapper.find('img[alt="user"]').exists()).toBe(true);
  });

  it('dropdown menu is hidden by default', () => {
    const wrapper = mount(Navbar, mountOptions);
    expect(wrapper.find('.dropdown-menu').exists()).toBe(false);
  });

  it('toggles dropdown menu on user div click', async () => {
    const wrapper = mount(Navbar, mountOptions);
    const userImg = wrapper.find('.user.dropdown-trigger img');
    await userImg.trigger('click');
    expect(wrapper.find('.mega-menu').exists()).toBe(true);

    await userImg.trigger('click');
    expect(wrapper.find('.mega-menu').exists()).toBe(false);
  });

  it('calls logout and navigates to the admin login on logout click', async () => {
    const wrapper = mount(Navbar, mountOptions);

    // Open dropdown first
    await wrapper.find('.user.dropdown-trigger img').trigger('click');

    const logoutBtn = wrapper.find('.logout-btn');
    await logoutBtn.trigger('click');

    expect(mockPush).toHaveBeenCalledWith('/login-admin');
  });

  it('applies the saved language on mount', () => {
    localStorage.setItem('locale', 'en');

    mount(Navbar, mountOptions);

    expect(mockLocale.value).toBe('en');
    expect(document.documentElement.lang).toBe('en');
    expect(document.documentElement.dir).toBe('ltr');
    expect(document.body.dir).toBe('ltr');
  });

  it('toggles language from Arabic to English', async () => {
    const wrapper = mount(Navbar, mountOptions);
    const languageButton = wrapper.find('.language-toggle');

    expect(languageButton.text()).toBe('🇺🇸');
    expect(languageButton.attributes('aria-label')).toBe('Switch language to English');
    expect(languageButton.attributes('title')).toBe('Switch language to English');

    await languageButton.trigger('click');

    expect(mockLocale.value).toBe('en');
    expect(localStorage.getItem('locale')).toBe('en');
    expect(document.documentElement.lang).toBe('en');
    expect(document.documentElement.dir).toBe('ltr');
    expect(document.body.dir).toBe('ltr');
  });
});
