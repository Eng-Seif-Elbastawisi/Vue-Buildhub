import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import ArticleForm from '../ArticleForm.vue';

const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: {} } });

// Mock vue-router
vi.mock('vue-router', () => ({
  onBeforeRouteLeave: vi.fn(),
  onBeforeRouteUpdate: vi.fn(),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    resolve: vi.fn(),
  }),
  useRoute: () => ({
    query: {},
    params: { id: '1' },
    fullPath: '/eg/articles/edit/1',
  }),
  createRouter: vi.fn(() => ({
    getRoutes: vi.fn(() => []),
    beforeEach: vi.fn(),
    afterEach: vi.fn(),
  })),
  createWebHistory: vi.fn(),
}));

// Mock document module
vi.mock('@/modules/document', () => ({
  DocumentController: {
    getInstance: () => ({
      fetchList: vi.fn(),
    }),
  },
  IndexDocumentParams: class {},
}));

describe('ArticleForm', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const wrapper = mount(ArticleForm, {
      global: {
        plugins: [i18n],
        stubs: {
          Accordion: true,
          AccordionPanel: true,
          AccordionHeader: true,
          AccordionContent: true,
          Checkbox: true,
          HandleFilesUpload: true,
          UpdatedCustomInputSelect: true,
          FolderCrudIcon: true,
          UploadFileIcon: true,
          AccordionToggleIcon: true,
        },
        mocks: {
          $t: (msg: string) => msg,
        },
      },
    });
    expect(wrapper.exists()).toBe(true);
  });
});
