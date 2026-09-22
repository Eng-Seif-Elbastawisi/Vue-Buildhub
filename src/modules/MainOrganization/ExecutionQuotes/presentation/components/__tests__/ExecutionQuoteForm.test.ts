import { flushPromises, mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';

import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import ProjectPreviewShowModel from '@/modules/MainOrganization/Project/core/models/project.preview.show.model';

import ExecutionQuoteForm from '../ExecutionQuoteForm.vue';
import { QuoteSourceEnum } from '../../../core/constants/quote.source.enum';
import AddExecutionQuoteParams from '../../../core/params/add.execution.quote.params';

const { controller } = vi.hoisted(() => ({
  controller: () => ({
    fetchAsOptions: vi.fn().mockResolvedValue([]),
    fetchOne: vi
      .fn()
      .mockResolvedValue(
        new DataSuccess({
          data: new ProjectPreviewShowModel({ project_id: 20, quote_type_id: 15 }),
        }),
      ),
    isListFailed: vi.fn().mockReturnValue(false),
    isListSuccess: vi.fn().mockReturnValue(true),
  }),
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
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

const SelectStub = {
  name: 'UpdatedCustomInputSelect',
  props: ['id', 'modelValue'],
  emits: ['update:modelValue'],
  template:
    '<button :id="id" class="select-stub" :data-id="id" @click="$emit(\'update:modelValue\', { id: 9, title: id })" />',
};

const mountForm = () =>
  mount(ExecutionQuoteForm, {
    global: {
      stubs: { UpdatedCustomInputSelect: SelectStub },
      mocks: { $t: (key: string) => key },
    },
  });

describe('ExecutionQuoteForm', () => {
  it('starts in execution-only mode and emits integer source params', () => {
    const wrapper = mountForm();
    const params = wrapper.emitted('updateData')?.at(-1)?.[0] as AddExecutionQuoteParams;

    expect(wrapper.find('#execution-quote-project').exists()).toBe(true);
    expect(wrapper.find('#execution-design-quote').exists()).toBe(false);
    expect(params).toBeInstanceOf(AddExecutionQuoteParams);
    expect(params.toMap().quote_source).toBe(QuoteSourceEnum.EXECUTION_ONLY);
  });

  it('switches to the design quote fields and hides direct fields', async () => {
    const wrapper = mountForm();

    await wrapper.findAll('button[role="radio"]').at(1)?.trigger('click');

    expect(wrapper.find('#execution-quote-project').exists()).toBe(false);
    expect(wrapper.find('#execution-design-quote').exists()).toBe(true);

    const params = wrapper.emitted('updateData')?.at(-1)?.[0] as AddExecutionQuoteParams;
    expect(params.toMap().quote_source).toBe(QuoteSourceEnum.EXECUTION_FROM_DESIGN_QUOTE);
  });

  it('serializes both design quote IDs after selecting a design quote', async () => {
    const wrapper = mountForm();

    await wrapper.findAll('button[role="radio"]').at(1)?.trigger('click');
    await wrapper.find('#execution-quote-client').trigger('click');
    await wrapper.find('#execution-design-quote').trigger('click');
    await flushPromises();

    const params = wrapper.emitted('updateData')?.at(-1)?.[0] as AddExecutionQuoteParams;

    expect(params.toMap()).toEqual({
      client_id: 9,
      project_id: 20,
      quote_type_id: 15,
      quote_source: QuoteSourceEnum.EXECUTION_FROM_DESIGN_QUOTE,
    });
  });
});
