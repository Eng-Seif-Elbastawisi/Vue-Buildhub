import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import ProjectPreviewShowModel from '@/modules/MainOrganization/Project/core/models/project.preview.show.model';

import ExecutionQuoteForm from '../ExecutionQuoteForm.vue';
import { QuoteSourceEnum } from '../../../core/constants/quote.source.enum';
import AddExecutionQuoteParams from '../../../core/params/add.execution.quote.params';

const { controller, routeParams } = vi.hoisted(() => ({
  controller: () => ({
    fetchAsOptions: vi.fn().mockResolvedValue([]),
    fetchOne: vi.fn().mockResolvedValue(
      new DataSuccess({
        data: new ProjectPreviewShowModel({ project_id: 20, quote_type_id: 15 }),
      }),
    ),
    isListFailed: vi.fn().mockReturnValue(false),
    isListSuccess: vi.fn().mockReturnValue(true),
  }),
  routeParams: { stageId: undefined as string | undefined },
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useRoute: () => ({ params: routeParams }),
  createRouter: vi.fn(() => ({ push: vi.fn(), beforeEach: vi.fn() })),
  createWebHistory: vi.fn(),
}));

vi.mock('@/modules/MainOrganization/client/presentation/controllers/client.controller', () => ({
  default: { getInstance: vi.fn(controller) },
}));
vi.mock('@/modules/MainOrganization/Project/presentation/controllers/project.controller', () => ({
  default: { getInstance: vi.fn(controller) },
}));
vi.mock(
  '@/modules/MainOrganization/Project/presentation/controllers/project.preview.controller',
  () => ({ default: { getInstance: vi.fn(controller) } }),
);
vi.mock(
  '@/modules/MainOrganization/QuoteTypes/presentation/controllers/quote.types.controller',
  () => ({ default: { getInstance: vi.fn(controller) } }),
);
vi.mock('@/modules/MainOrganization/employee/presentation/controllers/employee.controller', () => ({
  default: { getInstance: vi.fn(controller) },
}));

vi.mock('../builder/ExecutionQuoteBuilder.vue', () => ({
  default: {
    name: 'ExecutionQuoteBuilder',
    props: ['modelValue', 'enabled', 'loading'],
    emits: ['update:modelValue', 'update:stages'],
    template: '<div class="execution-quote-builder-stub" />',
  },
}));

const SelectStub = {
  name: 'UpdatedCustomInputSelect',
  props: ['id', 'label', 'modelValue'],
  emits: ['update:modelValue'],
  template:
    '<label :for="id">{{ label }}</label><button :id="id" class="select-stub" :data-id="id" @click="$emit(\'update:modelValue\', { id: 9, title: id })" />',
};

const mountForm = () =>
  mount(ExecutionQuoteForm, {
    global: {
      stubs: { UpdatedCustomInputSelect: SelectStub },
      mocks: { $t: (key: string) => key },
    },
  });

describe('ExecutionQuoteForm', () => {
  beforeEach(() => {
    routeParams.stageId = undefined;
  });

  it('starts in execution-only mode and emits integer source params', () => {
    const wrapper = mountForm();
    const params = wrapper.emitted('updateData')?.at(-1)?.[0] as AddExecutionQuoteParams;

    expect(wrapper.find('#execution-quote-project').exists()).toBe(true);
    expect(wrapper.find('#execution-design-quote').exists()).toBe(false);
    expect(params).toBeInstanceOf(AddExecutionQuoteParams);
    expect(params.toMap().quote_source).toBe(QuoteSourceEnum.EXECUTION_ONLY);
  });

  it('keeps every execution-only select and its label in one field container', () => {
    const wrapper = mountForm();
    const selectFields = wrapper.findAll('.quote-data__field');

    expect(selectFields).toHaveLength(4);
    expect(selectFields.every((field) => field.find('.select-stub').exists())).toBe(true);
    expect(selectFields.map((field) => field.get('label').text())).toEqual([
      'execution_quote.fields.client',
      'execution_quote.fields.project',
      'execution_quote.fields.quote_type',
      'execution_quote.fields.price_employee',
    ]);
  });

  it('switches to the design quote fields and hides direct fields', async () => {
    const wrapper = mountForm();

    await wrapper.findAll('button[role="radio"]').at(1)?.trigger('click');

    expect(wrapper.find('#execution-quote-project').exists()).toBe(false);
    expect(wrapper.find('#execution-design-quote').exists()).toBe(true);

    const params = wrapper.emitted('updateData')?.at(-1)?.[0] as AddExecutionQuoteParams;
    expect(params.toMap().quote_source).toBe(QuoteSourceEnum.EXECUTION_FROM_DESIGN_QUOTE);
  });

  it('serializes design quote id plus derived project and quote type IDs', async () => {
    const wrapper = mountForm();

    await wrapper.findAll('button[role="radio"]').at(1)?.trigger('click');
    await wrapper.find('#execution-quote-client').trigger('click');
    await wrapper.find('#execution-design-project').trigger('click');
    await wrapper.find('#execution-design-quote-type').trigger('click');
    await wrapper.find('#execution-design-quote').trigger('click');
    await flushPromises();

    const params = wrapper.emitted('updateData')?.at(-1)?.[0] as AddExecutionQuoteParams;

    expect(params.toMap()).toEqual({
      client_id: 9,
      project_id: 20,
      quote_type_id: 15,
      quote_source: QuoteSourceEnum.EXECUTION_FROM_DESIGN_QUOTE,
      design_quote_id: 9,
    });
  });

  it('shows only the focused builder on a stage route', () => {
    routeParams.stageId = '12';

    const wrapper = mountForm();

    expect(wrapper.classes()).toContain('execution-quote--stage-page');
    expect(wrapper.find('.execution-quote__header').exists()).toBe(false);
    expect(wrapper.find('.source-section').exists()).toBe(false);
    expect(wrapper.find('.execution-quote-builder-stub').exists()).toBe(true);
  });
});
