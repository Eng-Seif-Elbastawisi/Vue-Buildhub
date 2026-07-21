import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import InvoiceModel from '../../../core/models/invoice.model';
import AutoInvoicesModal from '../AutoInvoicesModal.vue';

const fetchAutoInvoices = vi.hoisted(() => vi.fn());

vi.mock('../../controllers/invoice.controller', () => ({
  default: { getInstance: () => ({ fetchAutoInvoices }) },
}));

describe('AutoInvoicesModal', () => {
  beforeEach(() => {
    fetchAutoInvoices.mockReset();
    fetchAutoInvoices.mockResolvedValue(
      new DataSuccess({
        data: [
          new InvoiceModel({
            id: 23,
            invoice_number: 'INV-23',
            invoice_date: '2026-07-21',
            invoice_amount: 2500,
          }),
        ],
      }),
    );
  });

  it('loads and displays auto invoices for the project', async () => {
    const wrapper = mount(AutoInvoicesModal, {
      props: { projectId: 30 },
      global: { mocks: { $t: (key: string) => key } },
    });
    await flushPromises();

    expect(fetchAutoInvoices.mock.calls[0][0].toMap()).toEqual({ project_id: 30 });
    expect(wrapper.text()).toContain('INV-23');
    expect(wrapper.text()).toContain('2,500');

    await wrapper.find('.auto-invoices-modal__close').trigger('click');
    expect(wrapper.emitted('close')).toHaveLength(1);
  });
});
