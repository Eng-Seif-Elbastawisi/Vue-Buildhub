import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import InvoicePaymentModel from '@/modules/MainOrganization/InvoicePayment/core/models/invoice.payment.model';
import InvoiceShowModel from '../../../../core/models/invoice.show.model';
import InvoiceTimelineCard from '../InvoiceTimelineCard.vue';

describe('InvoiceTimelineCard', () => {
  it('renders invoice and payment timeline entries', () => {
    const wrapper = mount(InvoiceTimelineCard, {
      props: {
        invoice: InvoiceShowModel.example,
        payments: [InvoicePaymentModel.example],
        isPaid: true,
        formatDateTime: (value?: string | null) => value || '-',
        paymentMethodLabel: () => 'Bank transfer',
      },
      global: {
        mocks: {
          $t: (key: string) => key,
        },
      },
    });

    expect(wrapper.text()).toContain('invoice_show.invoice_created');
    expect(wrapper.text()).toContain('invoice_show.invoice_marked_paid');
  });
});
