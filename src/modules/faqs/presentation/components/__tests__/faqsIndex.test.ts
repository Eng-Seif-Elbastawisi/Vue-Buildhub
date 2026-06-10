import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { ref } from 'vue';
import faqsIndex from '../faqsIndex.vue';
import FaqsController from '../../controllers/faqs.controller';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import FaqsModel from '../../../core/models/faqs.model';

// Mock vue-router
const pushMock = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
  useRoute: () => ({
    params: { country_code: 'eg' },
  }),
}));

// Create a stable mock instance with reactive refs
const mockInstance = {
  fetchList: vi.fn(),
  delete: vi.fn(),
  listState: ref(null),
  errorMessage: ref(''),
};

// Mock FaqsController
vi.mock('../../controllers/faqs.controller', () => {
  return {
    default: {
      getInstance: () => mockInstance,
    },
  };
});

describe('faqsIndex', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockInstance.listState.value = null;
    mockInstance.errorMessage.value = '';
  });

  const mountOptions = {
    global: {
      stubs: {
        'router-link': true,
        EmptyFaqs: true,
        EditpinIcon: true,
        IconAdd: true,
        IconMins: true,
      },
      mocks: {
        $t: (msg: string) => msg,
      },
    },
  };

  it('renders and fetches list on mount', async () => {
    const controller = FaqsController.getInstance();
    const wrapper = mount(faqsIndex, mountOptions);
    await flushPromises();

    expect(controller.fetchList).toHaveBeenCalled();
    expect(wrapper.exists()).toBe(true);
  });

  it('displays faqs when data is present', async () => {
    const controller = FaqsController.getInstance();
    const mockFaqs = [
      new FaqsModel({ id: 1, question: { en: 'Q1' }, answer: { en: 'A1' } }),
      new FaqsModel({ id: 2, question: { en: 'Q2' }, answer: { en: 'A2' } }),
    ];
    vi.mocked(controller.fetchList).mockImplementation(() => {
      controller.listState.value = new DataSuccess({ data: mockFaqs });
      return Promise.resolve();
    });

    const wrapper = mount(faqsIndex, mountOptions);
    await flushPromises();

    expect(wrapper.findAll('.faq-card').length).toBe(2);
    expect(wrapper.find('.faq-question').text()).toBe('Q1');
  });

  it('shows empty state when no data is present', async () => {
    const controller = FaqsController.getInstance();
    vi.mocked(controller.fetchList).mockImplementation(() => {
      controller.listState.value = new DataSuccess({ data: [] });
      return Promise.resolve();
    });

    const wrapper = mount(faqsIndex, mountOptions);
    await flushPromises();

    expect(wrapper.find('.empty-data').exists()).toBe(true);
  });

  it('calls controller.delete when delete button is clicked', async () => {
    const controller = FaqsController.getInstance();
    const mockFaqs = [new FaqsModel({ id: 1, question: { en: 'Q1' }, answer: { en: 'A1' } })];
    vi.mocked(controller.fetchList).mockImplementation(() => {
      controller.listState.value = new DataSuccess({ data: mockFaqs });
      return Promise.resolve();
    });

    const wrapper = mount(faqsIndex, mountOptions);
    await flushPromises();

    await wrapper.find('.delete-btn').trigger('click');

    expect(controller.delete).toHaveBeenCalled();
  });

  it('toggles expand state when clicking a row', async () => {
    const controller = FaqsController.getInstance();
    const mockFaqs = [new FaqsModel({ id: 1, question: { en: 'Q1' }, answer: { en: 'A1' } })];
    vi.mocked(controller.fetchList).mockImplementation(() => {
      controller.listState.value = new DataSuccess({ data: mockFaqs });
      return Promise.resolve();
    });

    const wrapper = mount(faqsIndex, mountOptions);
    await flushPromises();
    await wrapper.vm.$nextTick();

    // Initially expandedIndex is 0
    expect(wrapper.find('.faq-answer').exists()).toBe(true);

    await wrapper.find('.faq-row-header').trigger('click');
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.faq-answer').exists()).toBe(false);
  });
});
