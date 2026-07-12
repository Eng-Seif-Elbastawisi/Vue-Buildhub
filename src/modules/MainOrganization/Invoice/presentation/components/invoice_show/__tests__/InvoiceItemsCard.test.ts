import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import InvoiceItemsCard from '../InvoiceItemsCard.vue';

const formatAmount = (value?: number | string | null) => Number(value ?? 0).toFixed(2);

describe('InvoiceItemsCard', () => {
  it('renders invoice items and totals', () => {
    const wrapper = mount(InvoiceItemsCard, {
      props: {
        currency: 'EGP',
        formatAmount,
        items: [
          {
            id: 1,
            description: 'Design services',
            quantity: 2,
            unit_price: 500,
            discount: 50,
            tax: 25,
            total: 975,
          },
        ],
      },
      global: {
        mocks: {
          $t: (key: string) => key,
        },
      },
    });

    expect(wrapper.text()).toContain('Design services');
    expect(wrapper.text()).toContain('975.00');
  });
});
