import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import InvoiceStatusOverview from '../InvoiceStatusOverview.vue';

describe('InvoiceStatusOverview', () => {
  it('renders invoice status overview values', () => {
    const wrapper = mount(InvoiceStatusOverview, {
      props: {
        invoiceDate: '05 Jul 2026',
        dueDate: '12 Jul 2026',
        statusLabel: 'Paid',
        exportStatusLabel: 'Not exported',
        currency: 'EGP',
      },
      global: {
        mocks: {
          $t: (key: string) => key,
        },
      },
    });

    expect(wrapper.text()).toContain('05 Jul 2026');
    expect(wrapper.text()).toContain('Paid');
    expect(wrapper.text()).toContain('EGP');
  });
});
