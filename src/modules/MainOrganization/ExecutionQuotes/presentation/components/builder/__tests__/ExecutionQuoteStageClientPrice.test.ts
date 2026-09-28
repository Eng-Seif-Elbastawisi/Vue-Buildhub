import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import ExecutionQuoteStageClientPrice from '../ExecutionQuoteStageClientPrice.vue';

const mountPricingField = (disabled = false) =>
  mount(ExecutionQuoteStageClientPrice, {
    props: { modelValue: null, disabled },
    global: { mocks: { $t: (key: string) => key } },
  });

describe('ExecutionQuoteStageClientPrice', () => {
  it('emits a lump-sum client stage price', async () => {
    const wrapper = mountPricingField();

    await wrapper.get('input').setValue('3500');

    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe(3500);
    expect(wrapper.find('.pricing-input__suffix').text()).toBe(
      'execution_quote.table.currency_egp',
    );
  });

  it('requires the value and clamps it to a minimum of one', async () => {
    const wrapper = mountPricingField();
    const input = wrapper.get('input');

    expect(input.attributes()).toMatchObject({
      min: '1',
      step: '1',
      required: '',
      'aria-required': 'true',
    });

    await input.setValue('0.5');

    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe(1);
  });

  it('can be disabled until a sub-stage is selected', () => {
    const wrapper = mountPricingField(true);

    expect(wrapper.get('input').attributes('disabled')).toBeDefined();
  });
});
