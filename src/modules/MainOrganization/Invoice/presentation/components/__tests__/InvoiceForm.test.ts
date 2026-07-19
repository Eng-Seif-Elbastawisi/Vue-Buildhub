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

const AppButtonStub = {
  name: 'AppButton',
  props: ['disabled', 'loading', 'title'],
  emits: ['click'],
  template:
    '<button class="app-button-stub" type="button" :disabled="disabled || loading" @click="$emit(\'click\', $event)"><slot /></button>',
};

const MultiLangInputStub = {
  name: 'MultiLangInput',
  props: ['fieldKey', 'label', 'languages', 'modelValue', 'type'],
  template: '<div class="multi-lang-stub" :data-field-key="fieldKey">{{ label }}</div>',
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
        AppButton: AppButtonStub,
        FieldHelpIcon: true,
        GroupIcon: true,
        InvoiceDocumentIcon: true,
        MultiLangInput: MultiLangInputStub,
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

const selectInvoiceType = async (
  wrapper: ReturnType<typeof mountForm>,
  invoiceType: InvoiceTypeEnum,
) => {
  await wrapper.find(`#invoice_type_${invoiceType}`).setValue(true);
};

describe('InvoiceForm', () => {
  it('renders the approved two-card structure with exactly two invoice type options', () => {
    const wrapper = mountForm(undefined, true);

    expect(wrapper.findAll('.invoice-form__card')).toHaveLength(2);
    expect(wrapper.find('.invoice-form__details').exists()).toBe(true);
    expect(wrapper.find('.invoice-form__type').exists()).toBe(true);
    expect(wrapper.findAll('input[type="radio"][name="invoice_type"]')).toHaveLength(2);
    expect(wrapper.find('[data-select-id="invoice_type"]').exists()).toBe(false);
  });

  it('defaults to SINGLE, renders the standard fields, and hides the invoices selector', async () => {
    const wrapper = mountForm(undefined, true);

    expect(
      wrapper.find(`#invoice_type_${InvoiceTypeEnum.SINGLE}`).attributes('checked'),
    ).toBeDefined();
    expect(findSelect(wrapper, 'invoice_project_id').exists()).toBe(true);
    expect(wrapper.find('#invoice_date').exists()).toBe(true);
    expect(wrapper.find('#invoice_amount').exists()).toBe(true);
    expect(wrapper.find('#invoice_notes').exists()).toBe(true);
    expect(wrapper.find('[data-select-id="invoice_ids"]').exists()).toBe(false);
    expect(wrapper.find('[data-field-key="title"]').exists()).toBe(false);

    findSelect(wrapper, 'invoice_project_id').vm.$emit('update:modelValue', {
      id: 10,
      title: 'Project 10',
    });
    await wrapper.find('#invoice_date').setValue('2026-07-05');
    await wrapper.find('#invoice_amount').setValue('15000');
    await wrapper.find('#invoice_notes').setValue('First design invoice');

    const emitted = wrapper.emitted('updateData')?.at(-1)?.[0] as {
      toMap: () => Record<string, unknown>;
    };

    expect(emitted.toMap()).toMatchObject({
      invoice_type: InvoiceTypeEnum.SINGLE,
      project_id: 10,
      invoice_date: '2026-07-05',
      invoice_amount: 15000,
      notes: 'First design invoice',
    });
    expect(emitted.toMap()).not.toHaveProperty('invoice_ids');
  });

  it('selects GROUP and keeps the project-filtered invoices field as a multi-select', async () => {
    const wrapper = mountForm(undefined, true);

    await selectInvoiceType(wrapper, InvoiceTypeEnum.GROUP);

    findSelect(wrapper, 'invoice_project_id').vm.$emit('update:modelValue', {
      id: 10,
      title: 'Project 10',
    });
    await wrapper.vm.$nextTick();

    const invoiceSelect = findSelect(wrapper, 'invoice_ids');
    const titleInput = wrapper.findComponent(MultiLangInputStub);

    expect(invoiceSelect.props('type')).toBe(2);
    expect(titleInput.exists()).toBe(true);
    expect(titleInput.props('languages')).toEqual(['en']);
    expect(invoiceSelect.props('params').toMap()).toMatchObject({
      project_id: 10,
      export_status: 0,
    });

    invoiceSelect.vm.$emit('update:modelValue', [
      { id: 1, title: 'INV-1' },
      { id: 2, title: 'INV-2' },
    ]);
    titleInput.vm.$emit('update:modelValue', {
      en: 'Design invoices group',
      ar: 'مجموعة فواتير التصميم',
    });

    expect(wrapper.find('#invoice_date').exists()).toBe(false);
    expect(wrapper.find('#invoice_amount').exists()).toBe(false);
    expect(wrapper.find('#invoice_notes').exists()).toBe(false);

    const emitted = wrapper.emitted('updateData')?.at(-1)?.[0] as {
      toMap: () => Record<string, unknown>;
    };

    expect(emitted.toMap()).toEqual({
      invoice_type: InvoiceTypeEnum.GROUP,
      project_id: 10,
      title: 'Design invoices group',
      invoice_ids: [1, 2],
    });
  });

  it('clears group-only invoice values when switching back to SINGLE', async () => {
    const wrapper = mountForm(undefined, true);

    await selectInvoiceType(wrapper, InvoiceTypeEnum.GROUP);
    findSelect(wrapper, 'invoice_project_id').vm.$emit('update:modelValue', {
      id: 10,
      title: 'Project 10',
    });
    await wrapper.vm.$nextTick();
    findSelect(wrapper, 'invoice_ids').vm.$emit('update:modelValue', [{ id: 1, title: 'INV-1' }]);

    await selectInvoiceType(wrapper, InvoiceTypeEnum.SINGLE);

    const emitted = wrapper.emitted('updateData')?.at(-1)?.[0] as {
      toMap: () => Record<string, unknown>;
    };

    expect(wrapper.find('[data-select-id="invoice_ids"]').exists()).toBe(false);
    expect(wrapper.find('[data-field-key="title"]').exists()).toBe(false);
    expect(emitted.toMap()).not.toHaveProperty('invoice_ids');
    expect(emitted.toMap()).not.toHaveProperty('title');
    expect(emitted.toMap()).toMatchObject({ invoice_type: InvoiceTypeEnum.SINGLE });
  });

  it('emits submit from the save button and preserves its loading state', async () => {
    const wrapper = mountForm(undefined, true);

    await wrapper.find('.app-button-stub').trigger('click');

    expect(wrapper.emitted('submit')).toHaveLength(1);

    await wrapper.setProps({ loading: true });

    expect(wrapper.find('.app-button-stub').attributes('disabled')).toBeDefined();
  });

  it('hydrates the existing editable fields from invoice data', () => {
    const wrapper = mountForm(InvoiceModel.example);

    expect((wrapper.find('#invoice_date').element as HTMLInputElement).value).toBe('2026-07-05');
    expect((wrapper.find('#invoice_amount').element as HTMLInputElement).value).toBe('15000');
  });
});
