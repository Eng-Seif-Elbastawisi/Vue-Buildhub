import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ExecutionQuoteAdd from '../ExecutionQuoteAdd.vue';

const { routeParams, replace, toastWarning } = vi.hoisted(() => ({
  routeParams: { stageId: undefined as string | undefined },
  replace: vi.fn(),
  toastWarning: vi.fn(),
}));

vi.mock('vue-router', () => ({
  useRoute: () => ({
    fullPath: '/organization/execution-quotes/add',
    params: routeParams,
  }),
  useRouter: () => ({ replace }),
}));

vi.mock('@/base/Presentation/Dialogs/dialog.manager', () => ({
  dialogManager: { toastWarning },
}));

vi.mock('../ExecutionQuoteForm.vue', () => ({
  default: {
    name: 'ExecutionQuoteForm',
    props: ['loading', 'executionQuoteId'],
    emits: ['updateData', 'updateDetails'],
    template: '<div class="execution-quote-form-stub" />',
  },
}));

vi.mock('../../controllers/execution.quote.controller', () => ({
  default: {
    getInstance: vi.fn(() => ({
      errorMessage: { value: null },
      createBase: vi.fn(),
      storeDetails: vi.fn(),
    })),
  },
}));

describe('ExecutionQuoteAdd', () => {
  beforeEach(() => {
    routeParams.stageId = undefined;
    replace.mockReset();
    toastWarning.mockReset();
  });

  it('renders the execution quote form and the first-step save action', () => {
    const wrapper = mount(ExecutionQuoteAdd, {
      global: { mocks: { $t: (key: string) => key } },
    });

    expect(wrapper.find('.execution-quote-form-stub').exists()).toBe(true);
    expect(wrapper.find('.execution-quote-add__save').exists()).toBe(true);
  });

  it('notifies and returns to quote setup when a stage URL is opened directly', () => {
    routeParams.stageId = '12';

    mount(ExecutionQuoteAdd, {
      global: { mocks: { $t: (key: string) => key } },
    });

    expect(toastWarning).toHaveBeenCalledWith('Save the quote data before opening a stage.');
    expect(replace).toHaveBeenCalledWith({ name: 'Add Execution Quote' });
  });
});
