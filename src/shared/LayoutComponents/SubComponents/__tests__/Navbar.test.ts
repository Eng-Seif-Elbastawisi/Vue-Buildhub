import { beforeEach, describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import Navbar from '../Navbar.vue';

const mockLocale = vi.hoisted(() => ({ value: 'ar' }));
const currentDir = dirname(fileURLToPath(import.meta.url));
const headerStyles = readFileSync(resolve(currentDir, '../../styles/_header.scss'), 'utf8');
const importedGlobalStyles = readFileSync(
  resolve(currentDir, '../../../../styles/main.min.css'),
  'utf8',
);

vi.mock('vue-i18n', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;

  return {
    ...actual,
    useI18n: () => ({
      locale: mockLocale,
    }),
  };
});

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

vi.mock(
  '@/modules/MainOrganization/Project/presentation/components/GlobalProjectSearch.vue',
  () => ({
    default: {
      name: 'GlobalProjectSearch',
      template: '<div class="global-project-search-stub" />',
    },
  }),
);

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
        IconLogout: true,
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

  it('renders the global project search', () => {
    const wrapper = mount(Navbar, mountOptions);
    expect(wrapper.find('.global-project-search-stub').exists()).toBe(true);
  });

  it('renders the user avatar image', () => {
    const wrapper = mount(Navbar, mountOptions);
    expect(wrapper.find('img[alt="user"]').exists()).toBe(true);
  });

  it('dropdown menu is hidden by default', () => {
    const wrapper = mount(Navbar, mountOptions);
    expect(wrapper.find('.dropdown-menu').exists()).toBe(false);
  });

  it('toggles the profile menu from the complete profile trigger', async () => {
    const wrapper = mount(Navbar, mountOptions);
    const profileTrigger = wrapper.find('.profile-trigger');

    expect(profileTrigger.attributes('aria-expanded')).toBe('false');

    await profileTrigger.trigger('click');
    expect(wrapper.find('.mega-menu').exists()).toBe(true);
    expect(profileTrigger.attributes('aria-expanded')).toBe('true');

    await profileTrigger.trigger('click');
    expect(wrapper.find('.mega-menu').exists()).toBe(false);
  });

  it('calls logout and navigates to the admin login on logout click', async () => {
    const wrapper = mount(Navbar, mountOptions);

    // Open dropdown first
    await wrapper.find('.profile-trigger').trigger('click');

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

    expect(languageButton.text()).toContain('AR');
    expect(languageButton.attributes('aria-label')).toBe('Switch language to English');
    expect(languageButton.attributes('title')).toBe('Switch language to English');

    await languageButton.trigger('click');

    expect(mockLocale.value).toBe('en');
    expect(localStorage.getItem('locale')).toBe('en');
    expect(document.documentElement.lang).toBe('en');
    expect(document.documentElement.dir).toBe('ltr');
    expect(document.body.dir).toBe('ltr');
  });

  it('positions the mega menu with RTL-aware logical inset', () => {
    expect(headerStyles).toContain('inset-inline-end: 50px;');
    expect(headerStyles).not.toContain('right: 50px;');
    expect(importedGlobalStyles).toContain('inset-inline-end: 50px;');
  });

  it('renders the current user identity without duplicating the existing sidebar controls', () => {
    const wrapper = mount(Navbar, mountOptions);

    expect(wrapper.find('.profile-data strong').text()).toBe('Test User');
    expect(wrapper.find('.profile-data small').text()).toBe('Admin');
    expect(wrapper.find('.nav-menu-button').exists()).toBe(false);
  });

  it('exposes the current system identity palette to the navbar styles', () => {
    const wrapper = mount(Navbar, mountOptions);
    const style = wrapper.find('header.header').attributes('style');

    expect(style).toContain('--palette-primary:');
    expect(style).toContain('--palette-secondary:');
    expect(style).toContain('--palette-accent:');
  });
});
