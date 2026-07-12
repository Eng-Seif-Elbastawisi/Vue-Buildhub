import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import InvoicePaymentSummary from '../InvoicePaymentSummary.vue';

const formatAmount = (value?: number | string | null) => Number(value ?? 0).toFixed(2);

describe('InvoicePaymentSummary', () => {
  it('renders paid and remaining amounts', () => {
    const wrapper = mount(InvoicePaymentSummary, {
      props: {
        totalAmount: 5000,
        paidAmount: 3000,
        remainingAmount: 2000,
        currency: 'EGP',
        isPaid: false,
        formatAmount,
      },
      global: {
        mocks: {
          $t: (key: string) => key,
        },
      },
    });

    expect(wrapper.text()).toContain('5000.00 EGP');
    expect(wrapper.text()).toContain('3000.00 EGP');
    expect(wrapper.text()).toContain('2000.00 EGP');
  });
});
