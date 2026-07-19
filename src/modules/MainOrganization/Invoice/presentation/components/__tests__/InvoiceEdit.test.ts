import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import InvoiceModel from '../../../core/models/invoice.model';
import AddInvoiceParams from '../../../core/params/add.invoice.params';
import InvoiceEdit from '../InvoiceEdit.vue';

const fetchOne = vi.fn();
const update = vi.fn();

vi.mock('vue-router', () => ({
  useRoute: () => ({ fullPath: '/invoice/edit/7', params: { id: '7' } }),
}));

vi.mock('@/modules/MainOrganization/Project/presentation/controllers/project.controller', () => ({
  default: {
    getInstance: () => ({}),
  },
}));

vi.mock('../../controllers/invoice.controller', () => ({
  default: {
    getInstance: () => ({
      fetchOne,
      update,
      itemData: { value: InvoiceModel.example },
      errorMessage: { value: null },
    }),
  },
}));

describe('InvoiceEdit', () => {
  it('fetches invoice and updates with invoice id', async () => {
    const params = new AddInvoiceParams({
      project_id: 10,
      invoice_number: 'INV-2026-0001',
      invoice_date: '2026-07-05',
      invoice_amount: 15000,
      notes: 'First design invoice',
    });

    const wrapper = mount(InvoiceEdit, {
      global: {
        mocks: {
          $t: (key: string) => key,
        },
        stubs: {
          InvoiceForm: {
            template:
              '<div><button class="emit-form" type="button" @click="$emit(\'updateData\', params)">form</button><button class="submit-form" type="button" @click="$emit(\'submit\')">submit</button></div>',
            setup() {
              return { params };
            },
          },
        },
      },
    });

    await wrapper.find('.emit-form').trigger('click');
    await wrapper.find('.submit-form').trigger('click');

    expect(fetchOne.mock.calls[0][0].toMap()).toEqual({ invoice_id: 7 });
    expect(update.mock.calls[0][0].toMap()).toEqual({
      invoice_id: 7,
      project_id: 10,
      invoice_number: 'INV-2026-0001',
      invoice_date: '2026-07-05',
      invoice_amount: 15000,
      notes: 'First design invoice',
    });
  });
});
