import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ExecutionQuoteForm from '../ExecutionQuoteForm.vue';
import { QuoteSourceEnum } from '../../../core/constants/quote.source.enum';
import { ExecutionQuoteTypeEnum } from '../../../core/constants/execution.quote.type.enum';
import type { ExecutionQuoteStageSummary } from '../../../core/models/execution.quote.show.model';
import AddExecutionQuoteParams from '../../../core/params/add.execution.quote.params';

const { controller, routeState } = vi.hoisted(() => ({
  controller: () => ({
    fetchAsOptions: vi.fn().mockResolvedValue([]),
    isListFailed: vi.fn().mockReturnValue(false),
    isListSuccess: vi.fn().mockReturnValue(true),
  }),
  routeState: {
    name: 'Add Execution Quote',
    params: { stageId: undefined as string | undefined },
  },
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useRoute: () => routeState,
  createRouter: vi.fn(() => ({ push: vi.fn(), beforeEach: vi.fn() })),
  createWebHistory: vi.fn(),
}));

vi.mock('@/modules/MainOrganization/client/presentation/controllers/client.controller', () => ({
  default: { getInstance: vi.fn(controller) },
}));
vi.mock('@/modules/MainOrganization/Project/presentation/controllers/project.controller', () => ({
  default: { getInstance: vi.fn(controller) },
}));
vi.mock('@/modules/MainOrganization/employee/presentation/controllers/employee.controller', () => ({
  default: { getInstance: vi.fn(controller) },
}));

vi.mock('../builder/ExecutionQuoteBuilder.vue', () => ({
  default: {
    name: 'ExecutionQuoteBuilder',
    props: ['modelValue', 'enabled', 'loading', 'executionQuoteId', 'initialStages'],
    emits: ['update:modelValue', 'update:stages', 'update:details'],
    template:
      '<button class="execution-quote-builder-stub" @click="$emit(\'update:modelValue\', 2)" />',
  },
}));

const SelectStub = {
  name: 'UpdatedCustomInputSelect',
  props: ['id', 'label', 'modelValue', 'params', 'disabled'],
  emits: ['update:modelValue'],
  template:
    '<label :for="id">{{ label }}</label><button :id="id" class="select-stub" :data-id="id" @click="$emit(\'update:modelValue\', { id: 9, title: id })" />',
};

const FileUploadStub = {
  name: 'HandleFilesUpload',
  emits: ['change'],
  template: '<button class="file-upload-stub" />',
};

const ClientDialogStub = {
  name: 'ExecutionQuoteClientDialog',
  props: ['modelValue'],
  emits: ['update:modelValue', 'created'],
  template: '<div class="client-dialog-stub" :data-visible="modelValue" />',
};

const mountForm = (
  executionQuoteId?: number,
  initialQuoteStages: ExecutionQuoteStageSummary[] = [],
) =>
  mount(ExecutionQuoteForm, {
    props: { executionQuoteId, initialQuoteStages },
    global: {
      stubs: {
        UpdatedCustomInputSelect: SelectStub,
        HandleFilesUpload: FileUploadStub,
        ExecutionQuoteClientDialog: ClientDialogStub,
      },
      mocks: { $t: (key: string) => key },
    },
  });

describe('ExecutionQuoteForm', () => {
  beforeEach(() => {
    routeState.name = 'Add Execution Quote';
    routeState.params.stageId = undefined;
  });

  it('starts in execution-only mode and emits integer source params', () => {
    const wrapper = mountForm();
    const params = wrapper.emitted('updateData')?.at(-1)?.[0] as AddExecutionQuoteParams;

    expect(wrapper.find('#execution-quote-project').exists()).toBe(true);
    expect(wrapper.find('#execution-quote-type').exists()).toBe(false);
    expect(wrapper.find('#execution-design-quote').exists()).toBe(false);
    expect(params).toBeInstanceOf(AddExecutionQuoteParams);
    expect(params.toMap().quote_source).toBe(QuoteSourceEnum.EXECUTION_ONLY);
  });

  it('keeps every execution-only select and its label in one field container', () => {
    const wrapper = mountForm();
    const selectFields = wrapper.findAll('.quote-data__field');

    expect(selectFields).toHaveLength(3);
    expect(selectFields.every((field) => field.find('.select-stub').exists())).toBe(true);
    expect(selectFields.map((field) => field.get('label').text())).toEqual([
      'execution_quote.fields.client',
      'execution_quote.fields.project',
      'execution_quote.fields.price_employee',
    ]);
  });

  it('keeps client and project but removes design-quote and quote-type selects', async () => {
    const wrapper = mountForm();

    wrapper.getComponent(FileUploadStub).vm.$emit('change', [
      {
        name: 'requirements.pdf',
        base64: 'data:application/pdf;base64,cXVvdGU=',
      },
    ]);
    await wrapper.vm.$nextTick();

    await wrapper.findAll('button[role="radio"]').at(1)?.trigger('click');

    expect(wrapper.find('#execution-quote-project').exists()).toBe(true);
    expect(wrapper.find('#execution-design-quote').exists()).toBe(false);
    expect(wrapper.find('#execution-quote-type').exists()).toBe(false);
    expect(wrapper.find('#execution-quote-price-employee').exists()).toBe(false);
    expect(wrapper.find('.quote-data__attachments').exists()).toBe(false);
    expect(wrapper.find('.quote-data__add-client').exists()).toBe(false);

    const params = wrapper.emitted('updateData')?.at(-1)?.[0] as AddExecutionQuoteParams;
    expect(params.toMap().quote_source).toBe(QuoteSourceEnum.EXECUTION_FROM_DESIGN_QUOTE);
    expect(params.toMap()).not.toHaveProperty('attachments');
  });

  it('sends an attachment list before the quote type in execution-only mode', async () => {
    const wrapper = mountForm();
    const html = wrapper.html();

    expect(html.indexOf('quote-data__attachments')).toBeLessThan(
      html.indexOf('quote-data__type-options'),
    );

    wrapper.getComponent(FileUploadStub).vm.$emit('change', [
      {
        name: 'requirements.pdf',
        base64: 'data:application/pdf;base64,cXVvdGU=',
      },
      {
        name: 'remote.pdf',
        base64: 'https://example.com/remote.pdf',
      },
    ]);
    await wrapper.vm.$nextTick();

    const params = wrapper.emitted('updateData')?.at(-1)?.[0] as AddExecutionQuoteParams;
    expect(params.toMap().attachments).toEqual([
      {
        file: 'data:application/pdf;base64,cXVvdGU=',
        alt: 'requirements.pdf',
      },
    ]);
  });

  it('opens the inline client dialog and selects the created client', async () => {
    const wrapper = mountForm();

    await wrapper.get('.quote-data__add-client').trigger('click');
    const clientDialog = wrapper.getComponent(ClientDialogStub);
    expect(clientDialog.props('modelValue')).toBe(true);

    clientDialog.vm.$emit('created', { id: 44, name: 'New client' });
    await wrapper.vm.$nextTick();

    const clientSelect = wrapper
      .findAllComponents(SelectStub)
      .find((select) => select.props('id') === 'execution-quote-client');
    const params = wrapper.emitted('updateData')?.at(-1)?.[0] as AddExecutionQuoteParams;

    expect(clientSelect?.props('modelValue')).toEqual({ id: 44, title: 'New client' });
    expect(params.toMap().client_id).toBe(44);
    expect(clientDialog.props('modelValue')).toBe(false);
  });

  it('filters project options by the selected client', async () => {
    const wrapper = mountForm();

    await wrapper.find('#execution-quote-client').trigger('click');

    const projectSelect = wrapper
      .findAllComponents(SelectStub)
      .find((select) => select.props('id') === 'execution-quote-project');

    expect(projectSelect?.props('params').toMap()).toMatchObject({ client_id: 9 });
  });

  it('takes quote_type only from the quote-type options', async () => {
    const wrapper = mountForm();
    const quoteTypeOptions = wrapper.findAll('.quote-type-option');

    expect(quoteTypeOptions).toHaveLength(2);
    await quoteTypeOptions[1].trigger('click');

    const base = wrapper.emitted('updateData')?.at(-1)?.[0] as AddExecutionQuoteParams;

    expect(base.toMap().quote_type_id).toBe(ExecutionQuoteTypeEnum.SUPERVISION);
    expect(base.toMap()).not.toHaveProperty('quote_type');
  });

  it('shows only the focused builder on a stage route', () => {
    routeState.name = 'Build Execution Quote';
    routeState.params.stageId = '12';

    const initialQuoteStages: ExecutionQuoteStageSummary[] = [
      { id: 5, stageId: 1, subStageId: 11, items: [] },
    ];
    const wrapper = mountForm(28, initialQuoteStages);

    expect(wrapper.classes()).toContain('execution-quote--stage-page');
    expect(wrapper.find('.execution-quote__header').exists()).toBe(false);
    expect(wrapper.find('.source-section').exists()).toBe(false);
    expect(wrapper.find('.execution-quote-builder-stub').exists()).toBe(true);
    expect(wrapper.getComponent({ name: 'ExecutionQuoteBuilder' }).props('initialStages')).toEqual(
      initialQuoteStages,
    );
  });

  it('hides the builder from the initial add page', () => {
    const wrapper = mountForm();

    expect(wrapper.find('.source-section').exists()).toBe(true);
    expect(wrapper.find('.execution-quote-builder-stub').exists()).toBe(false);
  });
});
