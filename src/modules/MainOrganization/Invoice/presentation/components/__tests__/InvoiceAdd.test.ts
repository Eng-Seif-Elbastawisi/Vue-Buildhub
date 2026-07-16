import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import AddInvoiceParams from '../../../core/params/add.invoice.params';
import InvoiceAdd from '../InvoiceAdd.vue';

const create = vi.fn();
const errorMessage = ref<string | null>(null);
const reset = vi.fn(() => {
  errorMessage.value = null;
});

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
      errorMessage,
      reset,
    }),
  },
}));

describe('InvoiceAdd', () => {
  beforeEach(() => {
    create.mockClear();
    reset.mockClear();
    errorMessage.value = null;
  });

  it('does not show empty-search feedback after navigating to the add page', () => {
    errorMessage.value = 'Invoices Fetched Successfully.';

    const wrapper = mount(InvoiceAdd, {
      global: {
        mocks: {
          $t: (key: string) => key,
        },
        stubs: {
          InvoiceForm: true,
        },
      },
    });

    expect(wrapper.find('.invoice-error').exists()).toBe(false);
  });

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
