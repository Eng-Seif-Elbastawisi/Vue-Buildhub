import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import { ExecutionQuoteTypeEnum } from '../../../../core/constants/execution.quote.type.enum';
import ExecutionQuoteClientPrice from '../ExecutionQuoteClientPrice.vue';

const mountPricingField = (quoteType: 1 | 2, disabled = false) =>
  mount(ExecutionQuoteClientPrice, {
    props: { modelValue: null, quoteType, disabled },
    global: { mocks: { $t: (key: string) => key } },
  });

describe('ExecutionQuoteClientPrice', () => {
  it('emits the client price for lump-sum quotes', async () => {
    const wrapper = mountPricingField(ExecutionQuoteTypeEnum.LUMP_SUM);

    await wrapper.get('input').setValue('3500');

    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe(3500);
    expect(wrapper.find('.pricing-input__suffix').text()).toBe(
      'execution_quote.table.currency_egp',
    );
  });

  it('shows and caps the percentage field for supervision quotes', async () => {
    const wrapper = mountPricingField(ExecutionQuoteTypeEnum.SUPERVISION);

    await wrapper.get('input').setValue('120');

    expect(wrapper.get('h2').text()).toBe('execution_quote.stage_pricing.percentage_title');
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe(100);
    expect(wrapper.find('.pricing-input__suffix').text()).toBe('%');
  });

  it('disables pricing until the quote stage has a backend id', () => {
    const wrapper = mountPricingField(ExecutionQuoteTypeEnum.SUPERVISION, true);

    expect(wrapper.get('input').attributes('disabled')).toBeDefined();
  });
});
