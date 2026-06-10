import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { ref } from 'vue';
import faqsEdit from '../faqsEdit.vue';
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
    params: { country_code: 'eg', id: '1' },
  }),
}));

// Create a stable mock instance with reactive refs
const mockInstance = {
  fetchList: vi.fn(),
  update: vi.fn(),
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

describe('faqsEdit', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockInstance.listState.value = null;
    mockInstance.errorMessage.value = '';
  });

  const mountOptions = {
    global: {
      stubs: {
        FaqsForm: true,
      },
      mocks: {
        $t: (msg: string) => msg,
      },
    },
  };

  it('renders and fetches FAQ on mount', async () => {
    const controller = FaqsController.getInstance();
    const mockFaq = new FaqsModel({ id: 1, question: { en: 'q' }, answer: { en: 'a' } });
    vi.mocked(controller.fetchList).mockImplementation(() => {
      controller.listState.value = new DataSuccess({ data: [mockFaq] });
      return Promise.resolve();
    });

    const wrapper = mount(faqsEdit, mountOptions);
    await flushPromises();

    expect(controller.fetchList).toHaveBeenCalled();
    expect(wrapper.find('.faqs-title').text()).toBe('faqs');
  });

  it('calls controller.update when save is clicked', async () => {
    const controller = FaqsController.getInstance();
    const mockFaq = new FaqsModel({ id: 1, question: { en: 'q' }, answer: { en: 'a' } });
    vi.mocked(controller.fetchList).mockImplementation(() => {
      controller.listState.value = new DataSuccess({ data: [mockFaq] });
      return Promise.resolve();
    });

    const wrapper = mount(faqsEdit, mountOptions);
    await flushPromises();

    // Directly set formParams if possible, or trigger updateData
    const mockParams = { question: { en: 'new q' }, answer: { en: 'new a' } };
    // @ts-expect-error - updateData is internal
    await wrapper.vm.updateData(mockParams);

    await wrapper.find('.btn-save').trigger('click');

    expect(controller.update).toHaveBeenCalled();
    expect(pushMock).toHaveBeenCalledWith('/eg/faqs');
  });

  it('redirects to list when cancel is clicked', async () => {
    const controller = FaqsController.getInstance();
    vi.mocked(controller.fetchList).mockImplementation(() => {
      controller.listState.value = new DataSuccess({ data: [] });
      return Promise.resolve();
    });

    const wrapper = mount(faqsEdit, mountOptions);
    await flushPromises();

    await wrapper.find('.btn-cancel').trigger('click');

    expect(pushMock).toHaveBeenCalledWith('/eg/faqs');
  });
});
