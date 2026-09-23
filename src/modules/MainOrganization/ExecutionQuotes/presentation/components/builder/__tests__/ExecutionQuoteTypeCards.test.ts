import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import { ExecutionQuoteTypeEnum } from '../../../../core/constants/execution.quote.type.enum';
import ExecutionQuoteTypeCards from '../ExecutionQuoteTypeCards.vue';

describe('ExecutionQuoteTypeCards', () => {
  it('renders named translation keys instead of numeric enum paths', () => {
    const wrapper = mount(ExecutionQuoteTypeCards, {
      props: { modelValue: null },
      global: { mocks: { $t: (key: string) => key } },
    });

    expect(wrapper.text()).toContain('execution_quote.quote_types.lump_sum.description');
    expect(wrapper.text()).toContain('execution_quote.quote_types.supervision.description');
    expect(wrapper.text()).not.toContain('execution_quote.quote_types.1.description');
    expect(wrapper.text()).not.toContain('execution_quote.quote_types.2.description');
  });

  it('emits the numeric enum selected by the user', async () => {
    const wrapper = mount(ExecutionQuoteTypeCards, {
      props: { modelValue: null },
      global: { mocks: { $t: (key: string) => key } },
    });

    await wrapper.findAll('.quote-type-option')[1].trigger('click');

    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toBe(ExecutionQuoteTypeEnum.SUPERVISION);
  });
});
