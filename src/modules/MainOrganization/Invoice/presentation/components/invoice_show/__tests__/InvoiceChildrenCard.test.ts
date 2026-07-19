import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { InvoiceStatusEnum } from '../../../../core/constant/invoice.status.enum';
import InvoiceShowModel from '../../../../core/models/invoice.show.model';
import InvoiceChildrenCard from '../InvoiceChildrenCard.vue';

describe('InvoiceChildrenCard', () => {
  it('renders child invoice details and emits its id for payment', async () => {
    const childInvoice = new InvoiceShowModel({
      id: 23,
      title: 'First child invoice',
      notes: 'First child note',
      invoice_amount: 3333,
      paid_amount: 500,
      remaining_amount: 2833,
      status: InvoiceStatusEnum.UNPAID,
    });
    const paidChildInvoice = new InvoiceShowModel({
      id: 24,
      title: 'Paid child invoice',
      invoice_amount: 2000,
      paid_amount: 2000,
      remaining_amount: 0,
      status: InvoiceStatusEnum.PAID,
    });
    const wrapper = mount(InvoiceChildrenCard, {
      props: {
        children: [childInvoice, paidChildInvoice],
        currency: 'EGP',
        formatAmount: (amount?: number | string | null) => Number(amount ?? 0).toFixed(2),
      },
      global: {
        mocks: {
          $t: (key: string) => key,
        },
      },
    });

    expect(wrapper.text()).toContain('First child invoice');
    expect(wrapper.text()).toContain('First child note');
    expect(wrapper.text()).toContain('3333.00 EGP');
    expect(wrapper.text()).toContain('500.00 EGP');
    expect(wrapper.text()).toContain('2833.00 EGP');
    expect(wrapper.find('.invoice-status-badge.is-unpaid').text()).toBe('Unpaid');
    expect(wrapper.find('.invoice-status-badge.is-paid').text()).toBe('Paid');
    expect(wrapper.findAll('.invoice-children-card__pay')).toHaveLength(1);

    await wrapper.find('.invoice-children-card__pay').trigger('click');

    expect(wrapper.emitted('pay')?.[0]).toEqual([23, 2833]);
  });
});
