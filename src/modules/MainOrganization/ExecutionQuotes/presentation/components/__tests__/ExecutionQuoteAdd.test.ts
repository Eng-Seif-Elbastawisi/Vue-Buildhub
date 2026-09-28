import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';

import { QuoteSourceEnum } from '../../../core/constants/quote.source.enum';
import { ExecutionQuoteItemSourceEnum } from '../../../core/constants/execution.quote.item.source.enum';
import { ExecutionQuoteTypeEnum } from '../../../core/constants/execution.quote.type.enum';
import ExecutionQuoteShowModel from '../../../core/models/execution.quote.show.model';
import AddExecutionQuoteParams from '../../../core/params/add.execution.quote.params';
import { ExecutionQuoteStagePricingDraft } from '../../../core/params/set.execution.quote.stage.pricing.params';
import SetExecutionQuoteSupervisionPricingParams from '../../../core/params/set.execution.quote.supervision.pricing.params';
import StoreExecutionQuoteDetailsParams from '../../../core/params/store.execution.quote.details.params';
import ExecutionQuoteAdd from '../ExecutionQuoteAdd.vue';

const { controller, push, replace, routeState, toastWarning } = vi.hoisted(() => ({
  controller: {
    errorMessage: { value: null },
    createBase: vi.fn(),
    fetchOne: vi.fn(),
    storeDetails: vi.fn(),
    storeBuilderChanges: vi.fn(),
  },
  push: vi.fn(),
  replace: vi.fn(),
  routeState: {
    name: 'Add Execution Quote',
    fullPath: '/organization/execution-quotes/add',
    params: { stageId: undefined as string | undefined },
    query: { id: undefined as string | undefined },
  },
  toastWarning: vi.fn(),
}));

vi.mock('vue-router', () => ({
  useRoute: () => routeState,
  useRouter: () => ({ push, replace }),
}));

vi.mock('@/base/Presentation/Dialogs/dialog.manager', () => ({
  dialogManager: { toastWarning },
}));

vi.mock('../ExecutionQuoteForm.vue', () => ({
  default: {
    name: 'ExecutionQuoteForm',
    props: [
      'loading',
      'executionQuoteId',
      'initialQuoteType',
      'initialQuoteStages',
      'initialSupervisionPercentage',
      'initialTotalQuotePrice',
      'initialSupervisionFee',
    ],
    emits: ['updateData', 'updateDetails', 'updatePricing', 'updateSupervisionPricing'],
    template: '<div class="execution-quote-form-stub" />',
  },
}));

vi.mock('../../controllers/execution.quote.controller', () => ({
  default: { getInstance: vi.fn(() => controller) },
}));

const mountAdd = () =>
  mount(ExecutionQuoteAdd, {
    global: { mocks: { $t: (key: string) => key } },
  });

describe('ExecutionQuoteAdd', () => {
  beforeEach(() => {
    routeState.name = 'Add Execution Quote';
    routeState.fullPath = '/organization/execution-quotes/add';
    routeState.params.stageId = undefined;
    routeState.query.id = undefined;
    controller.createBase.mockReset();
    controller.fetchOne.mockReset();
    controller.storeDetails.mockReset();
    controller.storeBuilderChanges.mockReset();
    push.mockReset().mockResolvedValue(undefined);
    replace.mockReset().mockResolvedValue(undefined);
    toastWarning.mockReset();
  });

  it('renders the setup form and first-step save action without the builder id', () => {
    const wrapper = mountAdd();

    expect(wrapper.find('.execution-quote-form-stub').exists()).toBe(true);
    expect(
      wrapper.getComponent({ name: 'ExecutionQuoteForm' }).props('executionQuoteId'),
    ).toBeNull();
    expect(wrapper.find('.execution-quote-add__save').exists()).toBe(true);
  });

  it('stores the base quote then opens the separate builder with its query id', async () => {
    controller.createBase.mockResolvedValue(new DataSuccess({ data: { id: 28 } }));
    const wrapper = mountAdd();
    const baseParams = new AddExecutionQuoteParams({
      quoteSource: QuoteSourceEnum.EXECUTION_ONLY,
      clientId: 1,
      projectId: 2,
      quoteType: ExecutionQuoteTypeEnum.LUMP_SUM,
      priceEmployeeId: 3,
      attachments: [{ file: 'data:application/pdf;base64,cXVvdGU=' }],
    });

    wrapper.getComponent({ name: 'ExecutionQuoteForm' }).vm.$emit('updateData', baseParams);
    await wrapper.get('.execution-quote-add__save').trigger('click');
    await flushPromises();

    expect(controller.createBase).toHaveBeenCalledWith(baseParams);
    expect(push).toHaveBeenCalledWith({
      name: 'Build Execution Quote',
      query: { id: '28' },
    });
  });

  it('notifies and returns to quote setup when the builder URL has no quote id', () => {
    routeState.name = 'Build Execution Quote';
    routeState.fullPath = '/organization/execution-quotes/add/stages';

    mountAdd();

    expect(toastWarning).toHaveBeenCalledWith('Save the quote data before opening a stage.');
    expect(replace).toHaveBeenCalledWith({ name: 'Add Execution Quote' });
    expect(controller.fetchOne).not.toHaveBeenCalled();
  });

  it('loads the stored quote type when the builder is opened or refreshed', async () => {
    routeState.name = 'Build Execution Quote';
    routeState.fullPath = '/organization/execution-quotes/add/stages?id=28';
    routeState.query.id = '28';
    controller.fetchOne.mockResolvedValue(
      new DataSuccess({
        data: new ExecutionQuoteShowModel({
          id: 28,
          quoteType: { id: ExecutionQuoteTypeEnum.SUPERVISION, title: 'Supervision' },
          supervisionPercentage: 10,
          totalQuotePrice: 2000,
          supervisionFee: 200,
          clientQuotePrice: 2200,
          quoteStages: [
            {
              id: 5,
              stageId: 1,
              subStageId: 11,
              stage: { id: 1, title: 'Main' },
              subStage: { id: 11, title: 'Sub' },
              items: [],
            },
          ],
        }),
      }),
    );

    const wrapper = mountAdd();
    await flushPromises();

    expect(controller.fetchOne).toHaveBeenCalledOnce();
    expect(wrapper.getComponent({ name: 'ExecutionQuoteForm' }).props('executionQuoteId')).toBe(28);
    expect(wrapper.getComponent({ name: 'ExecutionQuoteForm' }).props('initialQuoteType')).toBe(
      ExecutionQuoteTypeEnum.SUPERVISION,
    );
    expect(
      wrapper.getComponent({ name: 'ExecutionQuoteForm' }).props('initialQuoteStages'),
    ).toEqual([expect.objectContaining({ stageId: 1, subStageId: 11 })]);
    expect(
      wrapper.getComponent({ name: 'ExecutionQuoteForm' }).props('initialSupervisionPercentage'),
    ).toBe(10);
    expect(
      wrapper.getComponent({ name: 'ExecutionQuoteForm' }).props('initialTotalQuotePrice'),
    ).toBe(2000);
    expect(
      wrapper.getComponent({ name: 'ExecutionQuoteForm' }).props('initialSupervisionFee'),
    ).toBe(200);
  });

  it('saves the current batch and stays on the same main stage for more sub-stages', async () => {
    routeState.name = 'Build Execution Quote';
    routeState.fullPath = '/organization/execution-quotes/add/stages/129?id=48';
    routeState.params.stageId = '129';
    routeState.query.id = '48';
    controller.fetchOne.mockResolvedValue(
      new DataSuccess({
        data: new ExecutionQuoteShowModel({
          id: 48,
          quoteType: { id: ExecutionQuoteTypeEnum.LUMP_SUM, title: 'Lump_SUM' },
        }),
      }),
    );
    controller.storeBuilderChanges.mockResolvedValue(new DataSuccess({ data: undefined }));
    const detailsParams = new StoreExecutionQuoteDetailsParams({
      quoteId: 94,
      stageId: 129,
      subStageId: 41,
      itemType: ExecutionQuoteItemSourceEnum.PRODUCT,
      items: [{ morphId: 22, expectedPrice: 50, quantity: 2, unit: 9 }],
    });
    const pricingDraft = new ExecutionQuoteStagePricingDraft({
      quoteStageId: 45,
      stageId: 129,
      subStageId: 41,
      quoteType: ExecutionQuoteTypeEnum.LUMP_SUM,
      pricingValue: 1800,
    });
    const wrapper = mountAdd();
    await flushPromises();

    wrapper.getComponent({ name: 'ExecutionQuoteForm' }).vm.$emit('updateDetails', [detailsParams]);
    wrapper.getComponent({ name: 'ExecutionQuoteForm' }).vm.$emit('updatePricing', [pricingDraft]);
    await wrapper.vm.$nextTick();
    await wrapper.get('.execution-quote-add__save--details').trigger('click');
    await flushPromises();

    expect(controller.storeBuilderChanges).toHaveBeenCalledWith({
      detailRequests: [detailsParams],
      pricingDrafts: [pricingDraft],
      supervisionPricing: null,
      quoteId: 48,
      formKey: routeState.fullPath,
    });
    expect(replace).toHaveBeenCalledWith({
      name: 'Build Execution Quote',
      params: { stageId: '129' },
      query: { id: '48' },
    });
    expect(wrapper.get('.execution-quote-add__save--details').attributes('disabled')).toBeDefined();
  });

  it('saves a supervision percentage without requiring new items', async () => {
    routeState.name = 'Build Execution Quote';
    routeState.fullPath = '/organization/execution-quotes/add/stages/129?id=94';
    routeState.params.stageId = '129';
    routeState.query.id = '94';
    controller.fetchOne.mockResolvedValue(
      new DataSuccess({
        data: new ExecutionQuoteShowModel({
          id: 94,
          quoteType: { id: ExecutionQuoteTypeEnum.SUPERVISION, title: 'Supervision' },
        }),
      }),
    );
    controller.storeBuilderChanges.mockResolvedValue(new DataSuccess({ data: undefined }));
    const supervisionPricing = new SetExecutionQuoteSupervisionPricingParams({
      quoteId: 94,
      percentage: 10,
    });
    const wrapper = mountAdd();
    await flushPromises();

    wrapper
      .getComponent({ name: 'ExecutionQuoteForm' })
      .vm.$emit('updateSupervisionPricing', supervisionPricing);
    await wrapper.vm.$nextTick();
    await wrapper.get('.execution-quote-add__save--details').trigger('click');
    await flushPromises();

    expect(controller.storeBuilderChanges).toHaveBeenCalledWith({
      detailRequests: [],
      pricingDrafts: [],
      supervisionPricing,
      quoteId: 94,
      formKey: routeState.fullPath,
    });
  });

  it('does not enable saving when supervision pricing has not changed', async () => {
    routeState.name = 'Build Execution Quote';
    routeState.fullPath = '/organization/execution-quotes/add/stages/129?id=94';
    routeState.params.stageId = '129';
    routeState.query.id = '94';
    controller.fetchOne.mockResolvedValue(
      new DataSuccess({
        data: new ExecutionQuoteShowModel({
          id: 94,
          quoteType: { id: ExecutionQuoteTypeEnum.SUPERVISION, title: 'Supervision' },
        }),
      }),
    );
    const wrapper = mountAdd();
    await flushPromises();

    expect(wrapper.get('.execution-quote-add__save--details').attributes('disabled')).toBeDefined();
  });

  it('saves supervision stage items before final quote-wide pricing is entered', async () => {
    routeState.name = 'Build Execution Quote';
    routeState.fullPath = '/organization/execution-quotes/add/stages/129?id=94';
    routeState.params.stageId = '129';
    routeState.query.id = '94';
    controller.fetchOne.mockResolvedValue(
      new DataSuccess({
        data: new ExecutionQuoteShowModel({
          id: 94,
          quoteType: { id: ExecutionQuoteTypeEnum.SUPERVISION, title: 'Supervision' },
        }),
      }),
    );
    const detailsParams = new StoreExecutionQuoteDetailsParams({
      quoteId: 94,
      stageId: 129,
      subStageId: 150,
      itemType: ExecutionQuoteItemSourceEnum.PRODUCT,
      items: [{ morphId: 22, expectedPrice: 50, quantity: 2, unit: 9 }],
    });
    const wrapper = mountAdd();
    await flushPromises();

    wrapper.getComponent({ name: 'ExecutionQuoteForm' }).vm.$emit('updateSupervisionPricing', null);
    wrapper.getComponent({ name: 'ExecutionQuoteForm' }).vm.$emit('updateDetails', [detailsParams]);
    await wrapper.vm.$nextTick();
    await wrapper.get('.execution-quote-add__save--details').trigger('click');

    expect(toastWarning).not.toHaveBeenCalled();
    expect(controller.storeBuilderChanges).toHaveBeenCalledWith({
      detailRequests: [detailsParams],
      pricingDrafts: [],
      supervisionPricing: null,
      quoteId: 94,
      formKey: routeState.fullPath,
    });
  });
});
