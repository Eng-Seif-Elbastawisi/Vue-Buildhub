import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import ExecutionQuoteAdd from '../ExecutionQuoteAdd.vue';

vi.mock('vue-router', () => ({
  useRoute: () => ({ fullPath: '/organization/execution-quotes/add' }),
}));

vi.mock('../ExecutionQuoteForm.vue', () => ({
  default: {
    name: 'ExecutionQuoteForm',
    props: ['loading'],
    emits: ['updateData'],
    template: '<div class="execution-quote-form-stub" />',
  },
}));

vi.mock('../../controllers/execution.quote.controller', () => ({
  default: {
    getInstance: vi.fn(() => ({
      errorMessage: { value: null },
      create: vi.fn(),
    })),
  },
}));

describe('ExecutionQuoteAdd', () => {
  it('renders the execution quote form and save action', () => {
    const wrapper = mount(ExecutionQuoteAdd, {
      global: { mocks: { $t: (key: string) => key } },
    });

    expect(wrapper.find('.execution-quote-form-stub').exists()).toBe(true);
    expect(wrapper.find('.execution-quote-add__save').exists()).toBe(true);
  });
});
