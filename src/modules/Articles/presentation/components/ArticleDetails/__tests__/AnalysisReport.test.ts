import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import AnalysisReport from '../AnalysisReport.vue';

const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: {} } });

// Mock document module
vi.mock('@/modules/document', () => ({
  DocumentController: {
    getInstance: () => ({
      fetchList: vi.fn(),
    }),
  },
  IndexDocumentParams: class {},
}));

describe('AnalysisReport.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    const wrapper = mount(AnalysisReport, {
      props: {
        article: {
          id: 1,
          title: 'Test Article',
          analysisReport: [
            {
              id: 1,
              title: 'Correct count',
              count: 10,
              imageUrl: 'img.png',
              percentage: 50,
            },
          ],
        } as any,
      },
      global: {
        plugins: [i18n],
        stubs: {
          ProgressBar: true,
          UpdatedCustomInputSelect: true,
          AnalysisIcon: true,
        },
        mocks: {
          $t: (msg: string) => msg,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('.Analysis_Report').exists()).toBe(true);
    expect(wrapper.text()).toContain('Correct count');
  });
});
