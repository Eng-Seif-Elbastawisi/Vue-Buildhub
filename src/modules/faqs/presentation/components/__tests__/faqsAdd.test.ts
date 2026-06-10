import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { ref } from 'vue';
import faqsAdd from '../faqsAdd.vue';
import FaqsController from '../../controllers/faqs.controller';

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
  create: vi.fn(),
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

describe('faqsAdd', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
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

  it('renders correctly', () => {
    const wrapper = mount(faqsAdd, mountOptions);
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('.faqs-title').text()).toBe('faqs');
  });

  it('calls controller.create when save is clicked', async () => {
    const wrapper = mount(faqsAdd, mountOptions);
    const controller = FaqsController.getInstance();

    // Simulate updating form data
    const mockParams = { question: { en: 'q' }, answer: { en: 'a' } };
    // @ts-expect-error - updateData is internal but we want to trigger it
    wrapper.vm.updateData(mockParams);

    await wrapper.find('.btn-save').trigger('click');

    expect(controller.create).toHaveBeenCalled();
  });

  it('redirects to list when cancel is clicked', async () => {
    const wrapper = mount(faqsAdd, mountOptions);

    await wrapper.find('.btn-cancel').trigger('click');

    expect(pushMock).toHaveBeenCalledWith('/eg/faqs');
  });
});
