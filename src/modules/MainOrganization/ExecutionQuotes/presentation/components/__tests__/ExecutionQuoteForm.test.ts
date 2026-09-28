import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ExecutionQuoteForm from '../ExecutionQuoteForm.vue';
import { QuoteSourceEnum } from '../../../core/constants/quote.source.enum';
import { ExecutionQuoteTypeEnum } from '../../../core/constants/execution.quote.type.enum';
import type { ExecutionQuoteStageSummary } from '../../../core/models/execution.quote.show.model';
import AddExecutionQuoteParams from '../../../core/params/add.execution.quote.params';
import type SetExecutionQuoteSupervisionPricingParams from '../../../core/params/set.execution.quote.supervision.pricing.params';

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
vi.mock('@/modules/shared/ClientSource/presentation/controllers/client.source.controller', () => ({
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
    emits: ['update:modelValue', 'update:stages', 'update:details', 'update:pricing'],
    template:
      '<button class="execution-quote-builder-stub" @click="$emit(\'update:modelValue\', 2)" />',
  },
}));

const SupervisionPricingStub = {
  name: 'ExecutionQuoteSupervisionPricing',
  props: ['modelValue', 'internalCost', 'clientTotal', 'disabled'],
  emits: ['update:modelValue'],
  template: `
    <button
      class="supervision-pricing-stub"
      :data-percentage="modelValue"
      :data-internal-cost="internalCost"
      :data-client-total="clientTotal"
      :disabled="disabled"
      @click="$emit('update:modelValue', 12)"
    />
  `,
};

const SelectStub = {
  name: 'UpdatedCustomInputSelect',
  props: ['id', 'label', 'modelValue', 'params', 'disabled'],
  emits: ['update:modelValue'],
  template:
    '<label :for="id">{{ label }}</label><button :id="id" class="select-stub" :data-id="id" @click="$emit(\'update:modelValue\', { id: 9, title: id })" />',
};

const FileUploadStub = {
  name: 'HandleFilesUpload',
  props: { required: Boolean },
  emits: ['change'],
  template: '<button class="file-upload-stub" />',
};

const FieldHelpIconStub = {
  name: 'FieldHelpIcon',
  props: ['label', 'fieldName', 'fieldId'],
  template: '<span class="field-help-stub" />',
};

const mountForm = (
  executionQuoteId?: number,
  initialQuoteStages: ExecutionQuoteStageSummary[] = [],
  initialQuoteType?: (typeof ExecutionQuoteTypeEnum)[keyof typeof ExecutionQuoteTypeEnum],
) =>
  mount(ExecutionQuoteForm, {
    props: {
      executionQuoteId,
      initialQuoteStages,
      initialQuoteType,
      initialSupervisionPercentage: 10,
      initialTotalQuotePrice: 1000,
      initialSupervisionFee: 100,
    },
    global: {
      stubs: {
        UpdatedCustomInputSelect: SelectStub,
        HandleFilesUpload: FileUploadStub,
        FieldHelpIcon: FieldHelpIconStub,
        ExecutionQuoteSupervisionPricing: SupervisionPricingStub,
      },
      mocks: { $t: (key: string) => key },
    },
  });

describe('ExecutionQuoteForm', () => {
  beforeEach(() => {
    routeState.name = 'Add Execution Quote';
    routeState.params.stageId = undefined;
  });

  it('starts in execution-only mode and emits base payload', () => {
    const wrapper = mountForm();
    const params = wrapper.emitted('updateData')?.at(-1)?.[0] as AddExecutionQuoteParams;

    expect(wrapper.find('#client_exist').exists()).toBe(true);
    expect(wrapper.find('#execution-quote-project').exists()).toBe(true);
    expect(params).toBeInstanceOf(AddExecutionQuoteParams);
    expect(params.toMap().quote_source).toBe(QuoteSourceEnum.EXECUTION_ONLY);
  });

  it('shows existing client dropdown when client_exist is 1', async () => {
    const wrapper = mountForm();
    const clientExistSelect = wrapper
      .findAllComponents(SelectStub)
      .find((s) => s.props('id') === 'client_exist');

    clientExistSelect?.vm.$emit('update:modelValue', { id: 1, title: 'Existing' });
    await wrapper.vm.$nextTick();

    expect(wrapper.find('#execution-quote-client').exists()).toBe(true);
    expect(wrapper.find('#client_name').exists()).toBe(false);

    const clientSelect = wrapper
      .findAllComponents(SelectStub)
      .find((s) => s.props('id') === 'execution-quote-client');
    clientSelect?.vm.$emit('update:modelValue', { id: 40, title: 'Acme Corp' });
    await wrapper.vm.$nextTick();

    const params = wrapper.emitted('updateData')?.at(-1)?.[0] as AddExecutionQuoteParams;
    expect(params.toMap().client_exist).toBe(true);
    expect(params.toMap().client_id).toBe(40);
  });

  it('shows new client inputs when client_exist is 0', async () => {
    const wrapper = mountForm();
    const clientExistSelect = wrapper
      .findAllComponents(SelectStub)
      .find((s) => s.props('id') === 'client_exist');

    clientExistSelect?.vm.$emit('update:modelValue', { id: 0, title: 'New' });
    await wrapper.vm.$nextTick();

    expect(wrapper.find('#execution-quote-client').exists()).toBe(false);
    expect(wrapper.find('#client_name').exists()).toBe(true);
    expect(wrapper.find('#client_phone').exists()).toBe(true);
    expect(wrapper.find('#client_email').exists()).toBe(true);
    expect(wrapper.find('#client_address').exists()).toBe(true);
    expect(wrapper.find('#client_source').exists()).toBe(true);

    await wrapper.find('#client_name').setValue('Ahmed Elmsery');
    await wrapper.find('#client_phone').setValue('0132295378');
    await wrapper.find('#client_email').setValue('ahmed@gmail.com');
    await wrapper.find('#client_address').setValue('Cairo');

    const clientSourceSelect = wrapper
      .findAllComponents(SelectStub)
      .find((s) => s.props('id') === 'client_source');
    clientSourceSelect?.vm.$emit('update:modelValue', { id: 2, title: 'Social Media' });
    await wrapper.vm.$nextTick();

    const params = wrapper.emitted('updateData')?.at(-1)?.[0] as AddExecutionQuoteParams;
    expect(params.toMap()).toMatchObject({
      client_exist: false,
      client_name: 'Ahmed Elmsery',
      client_phone: '0132295378',
      client_email: 'ahmed@gmail.com',
      client_address: 'Cairo',
      client_source_id: 2,
    });
  });

  it('sends attachments with payload when files are uploaded', async () => {
    const wrapper = mountForm();

    wrapper.getComponent(FileUploadStub).vm.$emit('change', [
      {
        name: 'Project Front View',
        base64: 'data:image/png;base64,iCC',
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
        file: 'data:image/png;base64,iCC',
        alt: 'Project Front View',
        link: null,
      },
    ]);
  });

  it('marks attachments as required', () => {
    const wrapper = mountForm();

    expect(wrapper.getComponent(FileUploadStub).props('required')).toBe(true);
  });

  it('filters project options by the selected existing client', async () => {
    const wrapper = mountForm();
    const clientExistSelect = wrapper
      .findAllComponents(SelectStub)
      .find((s) => s.props('id') === 'client_exist');

    clientExistSelect?.vm.$emit('update:modelValue', { id: 1, title: 'Existing' });
    await wrapper.vm.$nextTick();

    const clientSelect = wrapper
      .findAllComponents(SelectStub)
      .find((s) => s.props('id') === 'execution-quote-client');
    clientSelect?.vm.$emit('update:modelValue', { id: 9, title: 'Client 9' });
    await wrapper.vm.$nextTick();

    const projectSelect = wrapper
      .findAllComponents(SelectStub)
      .find((s) => s.props('id') === 'execution-quote-project');

    expect(projectSelect?.props('params').toMap()).toMatchObject({ client_id: 9 });
  });

  it('takes quote_type from the quote-type options', async () => {
    const wrapper = mountForm();
    const quoteTypeOptions = wrapper.findAll('.quote-type-option');

    expect(quoteTypeOptions).toHaveLength(2);
    await quoteTypeOptions[1].trigger('click');

    const base = wrapper.emitted('updateData')?.at(-1)?.[0] as AddExecutionQuoteParams;

    expect(base.toMap().quote_type).toBe(ExecutionQuoteTypeEnum.SUPERVISION);
  });

  it('shows only the focused builder on a stage route', () => {
    routeState.name = 'Build Execution Quote';
    routeState.params.stageId = '12';

    const initialQuoteStages: ExecutionQuoteStageSummary[] = [
      { id: 5, stageId: 1, subStageId: 11, items: [] },
    ];
    const wrapper = mountForm(28, initialQuoteStages, ExecutionQuoteTypeEnum.SUPERVISION);

    expect(wrapper.classes()).toContain('execution-quote--stage-page');
    expect(wrapper.find('.execution-quote__header').exists()).toBe(false);
    expect(wrapper.find('.source-section').exists()).toBe(false);
    expect(wrapper.find('.execution-quote-builder-stub').exists()).toBe(true);
    expect(wrapper.getComponent({ name: 'ExecutionQuoteBuilder' }).props('initialStages')).toEqual(
      initialQuoteStages,
    );
    expect(wrapper.find('.supervision-pricing-stub').exists()).toBe(false);
  });

  it('renders quote-wide supervision pricing only on the stage overview', async () => {
    routeState.name = 'Build Execution Quote';
    routeState.params.stageId = undefined;

    const wrapper = mountForm(28, [], ExecutionQuoteTypeEnum.SUPERVISION);
    const builder = wrapper.get('.execution-quote-builder-stub');
    const supervisionPricing = wrapper.get('.supervision-pricing-stub');

    expect(builder.element.parentElement).toBe(wrapper.element);
    expect(supervisionPricing.element.parentElement).toBe(wrapper.element);
    expect(builder.element.nextElementSibling).toBe(supervisionPricing.element);
    expect(supervisionPricing.attributes('disabled')).toBeDefined();
    expect(wrapper.getComponent(SupervisionPricingStub).props()).toMatchObject({
      modelValue: 10,
      internalCost: 1000,
      clientTotal: 100,
      disabled: true,
    });

    wrapper.getComponent({ name: 'ExecutionQuoteBuilder' }).vm.$emit('update:stages', [
      {
        stage_id: 1,
        client_price: null,
        items: [
          {
            stage_id: 11,
            source_type: 1,
            source_id: 17,
            quantity: 1,
            unit_price: 1000,
          },
        ],
      },
    ]);
    await wrapper.vm.$nextTick();

    expect(supervisionPricing.attributes('disabled')).toBeUndefined();
    await supervisionPricing.trigger('click');

    const pricing = wrapper.emitted('updateSupervisionPricing')?.at(-1)?.[0] as
      SetExecutionQuoteSupervisionPricingParams | undefined;
    expect(pricing?.toMap()).toEqual({
      quote_id: 28,
      quote_type: ExecutionQuoteTypeEnum.SUPERVISION,
      percentage: 12,
    });
  });

  it('hides the builder from the initial add page', () => {
    const wrapper = mountForm();

    expect(wrapper.find('.source-section').exists()).toBe(true);
    expect(wrapper.find('.execution-quote-builder-stub').exists()).toBe(false);
  });
});
