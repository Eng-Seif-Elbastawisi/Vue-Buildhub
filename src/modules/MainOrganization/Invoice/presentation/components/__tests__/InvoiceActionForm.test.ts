import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { InvoiceActionStatusEnum } from '../../../core/constant/invoice.action.status.enum';
import InvoiceModel from '../../../core/models/invoice.model';
import type SetInvoiceActionParams from '../../../core/params/set.invoice.action.params';
import InvoiceActionForm from '../InvoiceActionForm.vue';

const mockController = vi.hoisted(() => ({
  fetchAutoInvoices: vi.fn(),
  setInvoiceAction: vi.fn(),
}));
const mockRouter = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock('../../controllers/invoice.controller', () => ({
  default: { getInstance: () => mockController },
}));

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { project_id: '30' } }),
  useRouter: () => mockRouter,
}));

const SelectStub = {
  props: ['id'],
  emits: ['update:modelValue'],
  template:
    '<button type="button" :class="id" @click="$emit(\'update:modelValue\', selectionFor(id))">select</button>',
  methods: {
    selectionFor(id: string) {
      return id === 'invoice-action-status'
        ? { id: InvoiceActionStatusEnum.OFFER_ACCEPT, title: 'Offer accept' }
        : [
            { id: 23, title: 'INV-23' },
            { id: 24, title: 'INV-24' },
          ];
    },
  },
};

const AppButtonStub = {
  props: ['type', 'disabled', 'loading'],
  template:
    '<button :type="type" :disabled="disabled || loading" class="app-button-stub"><slot /></button>',
};

describe('InvoiceActionForm', () => {
  beforeEach(() => {
    mockController.fetchAutoInvoices.mockReset();
    mockController.setInvoiceAction.mockReset();
    mockRouter.push.mockReset();
    mockController.fetchAutoInvoices.mockResolvedValue(
      new DataSuccess({
        data: [
          new InvoiceModel({ id: 23, invoice_number: 'INV-23' }),
          new InvoiceModel({ id: 24, invoice_number: 'INV-24' }),
        ],
      }),
    );
    mockController.setInvoiceAction.mockResolvedValue(new DataSuccess<void>({}));
  });

  it('submits the selected invoice action and returns to the project show page', async () => {
    const wrapper = mount(InvoiceActionForm, {
      global: {
        mocks: { $t: (key: string) => key },
        stubs: {
          UpdatedCustomInputSelect: SelectStub,
          AppButton: AppButtonStub,
        },
      },
    });
    await flushPromises();

    expect(mockController.fetchAutoInvoices.mock.calls[0][0].toMap()).toEqual({
      project_id: 30,
    });

    await wrapper.find('.invoice-action-invoices').trigger('click');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    const params = mockController.setInvoiceAction.mock.calls[0][0] as SetInvoiceActionParams;
    expect(params.toMap()).toEqual({
      project_id: 30,
      action_status: InvoiceActionStatusEnum.OFFER_ACCEPT,
      invoice_ids: [23, 24],
    });
    expect(wrapper.text()).toContain('invoice_action.saved');
    expect(mockRouter.push).toHaveBeenCalledWith({
      name: 'show-project',
      params: { project_id: 30 },
    });
  });
});
