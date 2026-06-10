import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import ArticlesEdit from '../ArticlesEdit.vue';

// Mock dependencies
vi.mock('@/router', () => ({
  default: {
    push: vi.fn(),
    replace: vi.fn(),
  },
}));

vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({
    params: { id: '1' },
    fullPath: '/eg/articles/edit/1',
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

vi.mock('../controllers/Article.controller', () => ({
  default: {
    getInstance: () => ({
      fetchOne: vi.fn(),
      update: vi.fn(),
      itemData: { value: { id: 1, title: 'Test Article' } },
      errorMessage: { value: '' },
    }),
  },
}));

const globalConfig = {
  plugins: [createPinia()],
  stubs: {
    ArticleNewForm: true,
    AppButton: true,
    IconAccept: true,
  },
  mocks: {
    $t: (msg: string) => msg,
  },
};

describe('ArticlesEdit.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    const wrapper = mount(ArticlesEdit, { global: globalConfig });
    expect(wrapper.exists()).toBe(true);
  });

  it('contains the "Update Article" button', () => {
    const wrapper = mount(ArticlesEdit, { global: globalConfig });
    const updateButton = wrapper.findComponent({ name: 'AppButton' });
    expect(updateButton.exists()).toBe(true);
  });
});
