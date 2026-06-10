
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import AboutIndex from '../AboutIndex.vue';

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {}, params: { country_code: 'eg' }, fullPath: '/eg/about' }),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  createRouter: vi.fn(() => ({
    install: vi.fn(),
    push: vi.fn(),
    afterEach: vi.fn(),
    beforeEach: vi.fn(),
  })),
  createWebHistory: vi.fn(),
}));

vi.mock('@/modules/about/presentation/controllers/about.controller', () => ({
  default: {
    getInstance: vi.fn(() => ({
      fetchOne: vi.fn().mockResolvedValue({ isSuccess: true }),
      itemState: { value: { data: null } },
    })),
  },
}));

vi.mock('@/shared/icons/EditpinIcon.vue', () => ({
  default: { name: 'EditpinIcon', template: '<span />' },
}));
vi.mock('@/shared/icons/SocialIcons/LinksIcon.vue', () => ({
  default: { name: 'LinksIcon', template: '<span />' },
}));
vi.mock('@/shared/icons/About/EmptyData.vue', () => ({
  default: { name: 'EmptyData', template: '<div />' },
}));

const globalConfig = {
  mocks: { $t: (k: string) => k },
  stubs: { 'router-link': true, Teleport: true },
};

describe('AboutIndex', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('renders without errors', () => {
    const wrapper = mount(AboutIndex, { global: globalConfig });
    expect(wrapper.exists()).toBe(true);
  });

  it('renders the about-page container', () => {
    const wrapper = mount(AboutIndex, { global: globalConfig });
    expect(wrapper.find('.about-page').exists()).toBe(true);
  });
});
