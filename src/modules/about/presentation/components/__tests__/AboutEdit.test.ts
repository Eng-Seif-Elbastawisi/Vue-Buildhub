import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import AboutEdit from '../AboutEdit.vue';

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {}, params: {}, fullPath: '/about/edit' }),
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
      update: vi.fn().mockResolvedValue({ isSuccess: true }),
      fetchOne: vi.fn().mockResolvedValue({ isSuccess: true }),
      errorMessage: { value: '' },
      itemState: { value: { data: null } },
    })),
  },
}));

vi.mock('../AboutForm.vue', () => ({
  default: {
    name: 'AboutForm',
    template: '<div class="about-form" />',
    props: ['formKey', 'about'],
    emits: ['update-data'],
  },
}));

vi.mock('@/modules/about/core/params/show.about.params', () => ({
  default: class ShowAboutParams {
    toMap() {
      return {};
    }
  },
}));

describe('AboutEdit', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const wrapper = mount(AboutEdit, {
      global: {
        mocks: { $t: (k: string) => k },
        stubs: { Teleport: true, Transition: true },
      },
    });
    expect(wrapper.exists()).toBe(true);
  });

  it('renders the save button', () => {
    const wrapper = mount(AboutEdit, {
      global: {
        mocks: { $t: (k: string) => k },
        stubs: { Teleport: true, Transition: true },
      },
    });
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true);
  });

  it('renders the AboutForm component', () => {
    const wrapper = mount(AboutEdit, {
      global: {
        mocks: { $t: (k: string) => k },
        stubs: { Teleport: true, Transition: true },
      },
    });
    expect(wrapper.find('.about-form').exists()).toBe(true);
  });
});
