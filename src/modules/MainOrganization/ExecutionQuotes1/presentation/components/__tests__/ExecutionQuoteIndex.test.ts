import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import ExecutionQuoteIndex from '../ExecutionQuoteIndex.vue';

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('../../controllers/execution.quote.controller', () => ({
  default: {
    getInstance: vi.fn(() => ({
      listState: { value: {} },
      fetchList: vi.fn(),
    })),
  },
}));

describe('ExecutionQuoteIndex', () => {
  it('renders the execution quote list heading', () => {
    const wrapper = mount(ExecutionQuoteIndex, {
      global: { mocks: { $t: (key: string) => key } },
      stubs: { DataStatusBuilder: true },
    });

    expect(wrapper.text()).toContain('execution_quote.title');
  });
});
