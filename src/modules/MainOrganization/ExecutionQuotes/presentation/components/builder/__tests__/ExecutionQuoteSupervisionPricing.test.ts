import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import ExecutionQuoteSupervisionPricing from '../ExecutionQuoteSupervisionPricing.vue';

const mountPricing = (modelValue: number | null = null) =>
  mount(ExecutionQuoteSupervisionPricing, {
    props: {
      modelValue,
      internalCost: 819,
      supervisionFee: 409.5,
      clientTotal: 0,
    },
    global: { mocks: { $t: (key: string) => key } },
  });

describe('ExecutionQuoteSupervisionPricing', () => {
  it('shows backend pricing and emits the percentage without recalculating totals', async () => {
    const wrapper = mountPricing(50);

    const summaryValues = wrapper.findAll('.supervision-pricing__summary dd');
    expect(summaryValues[0].text()).toBe('819');
    expect(summaryValues[1].text()).toBe('409.5');
    expect(summaryValues[2].text()).toContain('0');

    await wrapper.get('input').setValue('60');

    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe(60);
    expect(summaryValues[1].text()).toBe('409.5');
    expect(summaryValues[2].text()).toContain('0');
  });

  it('requires a percentage from one to one hundred', async () => {
    const wrapper = mountPricing();
    const input = wrapper.get('input');

    expect(input.attributes()).toMatchObject({
      min: '1',
      max: '100',
      step: '1',
      required: '',
    });

    await input.setValue('0.5');
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe(1);

    await input.setValue('120');
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe(100);
    expect(input.element.value).toBe('100');
  });

  it('explains why pricing is disabled before quote items exist', () => {
    const wrapper = mount(ExecutionQuoteSupervisionPricing, {
      props: { modelValue: null, disabled: true },
      global: { mocks: { $t: (key: string) => key } },
    });

    expect(wrapper.attributes('aria-disabled')).toBe('true');
    expect(wrapper.get('input').attributes('disabled')).toBeDefined();
    expect(wrapper.get('#supervision-percentage-hint').text()).toContain(
      'execution_quote.supervision_pricing.add_items_to_enable',
    );
  });
});
