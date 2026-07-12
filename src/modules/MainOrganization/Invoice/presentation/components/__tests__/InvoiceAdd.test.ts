import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import AddInvoiceParams from '../../../core/params/add.invoice.params';
import InvoiceAdd from '../InvoiceAdd.vue';

const create = vi.fn();

vi.mock('vue-router', () => ({
  useRoute: () => ({ fullPath: '/invoice/add' }),
}));

vi.mock('@/modules/MainOrganization/Project/presentation/controllers/project.controller', () => ({
  default: {
    getInstance: () => ({}),
  },
}));

vi.mock('../../controllers/invoice.controller', () => ({
  default: {
    getInstance: () => ({
      create,
      errorMessage: { value: null },
    }),
  },
}));

describe('InvoiceAdd', () => {
  it('creates invoice with emitted form params', async () => {
    const params = new AddInvoiceParams({
      project_id: 10,
      invoice_number: 'INV-2026-0001',
      invoice_date: '2026-07-05',
      invoice_amount: 15000,
      notes: 'First design invoice',
    });

    const wrapper = mount(InvoiceAdd, {
      global: {
        mocks: {
          $t: (key: string) => key,
        },
        stubs: {
          InvoiceForm: {
            template:
              '<button class="emit-form" type="button" @click="$emit(\'updateData\', params)">form</button>',
            setup() {
              return { params };
            },
          },
        },
      },
    });

    await wrapper.find('.emit-form').trigger('click');
    await wrapper.find('.btn').trigger('click');

    expect(create).toHaveBeenCalledWith(params, undefined, '/invoice/add');
  });
});
