import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { InvoiceTypeEnum } from '../../../core/constant/invoice.type.enum';
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

vi.mock('../../controllers/invoice.controller', () => ({
  default: {
    getInstance: () => ({}),
  },
}));

const UpdatedCustomInputSelectStub = {
  name: 'UpdatedCustomInputSelect',
  props: ['id', 'label', 'modelValue', 'params', 'staticOptions', 'type'],
  template: '<div class="select-stub" :data-select-id="id">{{ label }}</div>',
};

const mountForm = (invoice?: InvoiceModel, enableGrouping = false) =>
  mount(InvoiceForm, {
    props: {
      invoice,
      enableGrouping,
      formKey: '/invoice/add',
    },
    global: {
      mocks: {
        $t: (key: string) => key,
      },
      stubs: {
        FieldHelpIcon: true,
        UpdatedCustomInputSelect: UpdatedCustomInputSelectStub,
      },
    },
  });

const findSelect = (wrapper: ReturnType<typeof mountForm>, id: string) => {
  const select = wrapper
    .findAllComponents(UpdatedCustomInputSelectStub)
    .find((candidate) => candidate.props('id') === id);

  if (!select) throw new Error(`Select ${id} was not rendered`);

  return select;
};

describe('InvoiceForm', () => {
  it('emits invoice params from project select and inputs', async () => {
    const wrapper = mountForm();

    findSelect(wrapper, 'invoice_project_id').vm.$emit('update:modelValue', {
      id: 10,
      title: 'Project 10',
    });
    await wrapper.find('#invoice_number').setValue('INV-2026-0001');
    await wrapper.find('#invoice_date').setValue('2026-07-05');
    await wrapper.find('#invoice_amount').setValue('15000');
    await wrapper.find('#invoice_notes').setValue('First design invoice');

    const emitted = wrapper.emitted('updateData')?.at(-1)?.[0] as {
      toMap: () => Record<string, unknown>;
    };

    expect(emitted.toMap()).toEqual({
      type: InvoiceTypeEnum.SINGLE,
      project_id: 10,
      invoice_number: 'INV-2026-0001',
      invoice_date: '2026-07-05',
      invoice_amount: 15000,
      notes: 'First design invoice',
    });
  });

  it('shows project invoices as a project-filtered multi-select in group mode', async () => {
    const wrapper = mountForm(undefined, true);

    expect(findSelect(wrapper, 'invoice_type').props('staticOptions')).toEqual([
      { id: InvoiceTypeEnum.SINGLE, title: 'Single' },
      { id: InvoiceTypeEnum.GROUP, title: 'Group' },
    ]);
    expect(wrapper.find('[data-select-id="invoice_project_id"]').exists()).toBe(false);

    findSelect(wrapper, 'invoice_type').vm.$emit('update:modelValue', {
      id: InvoiceTypeEnum.GROUP,
      title: 'Group',
    });
    await wrapper.vm.$nextTick();

    findSelect(wrapper, 'invoice_project_id').vm.$emit('update:modelValue', {
      id: 10,
      title: 'Project 10',
    });
    await wrapper.vm.$nextTick();

    const invoiceSelect = findSelect(wrapper, 'invoice_ids');

    expect(invoiceSelect.props('type')).toBe(2);
    expect(invoiceSelect.props('params').toMap()).toMatchObject({ project_id: 10 });

    await wrapper.find('#invoice_number').setValue('GROUP-2026-0001');
    await wrapper.find('#invoice_date').setValue('2026-07-19');
    await wrapper.find('#invoice_amount').setValue('30000');
    await wrapper.find('#invoice_notes').setValue('Grouped invoices');

    invoiceSelect.vm.$emit('update:modelValue', [
      { id: 1, title: 'INV-1' },
      { id: 2, title: 'INV-2' },
    ]);
    await wrapper.vm.$nextTick();

    const emitted = wrapper.emitted('updateData')?.at(-1)?.[0] as {
      toMap: () => Record<string, unknown>;
    };

    expect(emitted.toMap()).toEqual({
      type: InvoiceTypeEnum.GROUP,
      project_id: 10,
      invoice_ids: [1, 2],
      invoice_number: 'GROUP-2026-0001',
      invoice_date: '2026-07-19',
      invoice_amount: 30000,
      notes: 'Grouped invoices',
    });
    expect(wrapper.find('#invoice_number').exists()).toBe(true);
  });

  it('does not render the invoices select in single mode', async () => {
    const wrapper = mountForm(undefined, true);

    findSelect(wrapper, 'invoice_type').vm.$emit('update:modelValue', {
      id: InvoiceTypeEnum.SINGLE,
      title: 'Single',
    });
    await wrapper.vm.$nextTick();

    expect(wrapper.find('#invoice_number').exists()).toBe(true);
    expect(wrapper.find('[data-select-id="invoice_ids"]').exists()).toBe(false);
  });

  it('hydrates fields from invoice data in edit mode', () => {
    const wrapper = mountForm(InvoiceModel.example);

    expect((wrapper.find('#invoice_number').element as HTMLInputElement).value).toBe(
      'INV-2026-0001',
    );
    expect((wrapper.find('#invoice_date').element as HTMLInputElement).value).toBe('2026-07-05');
  });
});
