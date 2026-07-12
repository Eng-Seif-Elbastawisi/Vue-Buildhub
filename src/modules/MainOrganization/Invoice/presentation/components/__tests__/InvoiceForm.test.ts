import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import InvoiceModel from '../../../core/models/invoice.model';
import InvoiceForm from '../InvoiceForm.vue';

vi.mock('vue-router', () => ({
  onBeforeRouteLeave: vi.fn(),
}));

vi.mock('@/stores/formsStore', () => ({
  useFormsStore: () => ({
    getFormData: vi.fn(),
    showReturnWarning: vi.fn(),
  }),
}));

vi.mock('@/modules/MainOrganization/Project/presentation/controllers/project.controller', () => ({
  default: {
    getInstance: () => ({}),
  },
}));

const mountForm = (invoice?: InvoiceModel) =>
  mount(InvoiceForm, {
    props: {
      invoice,
      formKey: '/invoice/add',
    },
    global: {
      mocks: {
        $t: (key: string) => key,
      },
      stubs: {
        FieldHelpIcon: true,
        UpdatedCustomInputSelect: {
          props: ['label'],
          template:
            '<button class="project-select" type="button" @click="$emit(\'update:modelValue\', { id: 10, title: \'Project 10\' })">{{ label }}</button>',
        },
      },
    },
  });

describe('InvoiceForm', () => {
  it('emits invoice params from project select and inputs', async () => {
    const wrapper = mountForm();

    await wrapper.find('.project-select').trigger('click');
    await wrapper.find('#invoice_number').setValue('INV-2026-0001');
    await wrapper.find('#invoice_date').setValue('2026-07-05');
    await wrapper.find('#invoice_amount').setValue('15000');
    await wrapper.find('#invoice_notes').setValue('First design invoice');

    const emitted = wrapper.emitted('updateData')?.at(-1)?.[0] as {
      toMap: () => Record<string, unknown>;
    };

    expect(emitted.toMap()).toEqual({
      project_id: 10,
      invoice_number: 'INV-2026-0001',
      invoice_date: '2026-07-05',
      invoice_amount: 15000,
      notes: 'First design invoice',
    });
  });

  it('hydrates fields from invoice data in edit mode', () => {
    const wrapper = mountForm(InvoiceModel.example);

    expect((wrapper.find('#invoice_number').element as HTMLInputElement).value).toBe(
      'INV-2026-0001',
    );
    expect((wrapper.find('#invoice_date').element as HTMLInputElement).value).toBe('2026-07-05');
  });
});
