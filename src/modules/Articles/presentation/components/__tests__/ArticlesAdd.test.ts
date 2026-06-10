import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import ArticlesAdd from '../ArticlesAdd.vue';
import { ref } from 'vue';

// Mock dependencies
vi.mock('@/router', () => ({
  default: {
    push: vi.fn(),
    replace: vi.fn(),
  },
}));

vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({
    fullPath: '/eg/articles/add',
  })),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
  createRouter: vi.fn(() => ({
    getRoutes: vi.fn(() => []),
    beforeEach: vi.fn(),
    afterEach: vi.fn(),
  })),
  createWebHistory: vi.fn(),
}));

vi.mock('primevue/config', () => ({
  usePrimeVue: () => ({
    config: { ripple: true },
  }),
}));

vi.mock('../controllers/Article.controller', () => ({
  default: {
    getInstance: () => ({
      create: vi.fn(),
      errorMessage: ref(''),
    }),
  },
}));

const globalConfig = {
  plugins: [createPinia()],
  stubs: {
    ArticleForm: true,
    AppButton: true,
    IconAccept: true,
  },
  mocks: {
    $t: (msg: string) => msg,
  },
};

describe('ArticlesAdd.vue', () => { 
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    const wrapper = mount(ArticlesAdd, { global: globalConfig });
    expect(wrapper.exists()).toBe(true);
  });

  it('contains the "Save Article" button', () => {
    const wrapper = mount(ArticlesAdd, { global: globalConfig });
    const saveButton = wrapper.find('.save-emp');
    expect(saveButton.exists()).toBe(true);
  });

  it('contains the "Save As draft" button', () => {
    const wrapper = mount(ArticlesAdd, { global: globalConfig });
    const draftButton = wrapper.find('.btn-draft');
    expect(draftButton.exists()).toBe(true);
  });

  it('contains the "cancel" button', () => {
    const wrapper = mount(ArticlesAdd, { global: globalConfig });
    const cancelButton = wrapper.find('.btn-cancel');
    expect(cancelButton.exists()).toBe(true);
  });
});
