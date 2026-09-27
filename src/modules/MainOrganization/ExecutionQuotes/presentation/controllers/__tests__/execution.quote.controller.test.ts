import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';

import { ExecutionQuoteItemSourceEnum } from '../../../core/constants/execution.quote.item.source.enum';
import { ExecutionQuoteTypeEnum } from '../../../core/constants/execution.quote.type.enum';
import ExecutionQuoteShowModel from '../../../core/models/execution.quote.show.model';
import { ExecutionQuoteStagePricingDraft } from '../../../core/params/set.execution.quote.stage.pricing.params';
import StoreExecutionQuoteDetailsParams from '../../../core/params/store.execution.quote.details.params';
import ExecutionQuoteController from '../execution.quote.controller';

const { clearFormData, setStagePricing, show, storeDetails } = vi.hoisted(() => ({
  clearFormData: vi.fn(),
  setStagePricing: vi.fn(),
  show: vi.fn(),
  storeDetails: vi.fn(),
}));

vi.mock('@/stores/formsStore', () => ({
  useFormsStore: () => ({ clearFormData }),
}));

vi.mock('../../../data/repositories/execution.quote.repository', () => ({
  default: { getInstance: () => ({ setStagePricing, show, storeDetails }) },
}));

describe('ExecutionQuoteController', () => {
  beforeEach(() => {
    clearFormData.mockReset();
    setStagePricing.mockReset();
    show.mockReset();
    storeDetails.mockReset();
  });

  it('stores item and pricing requests as one builder change', async () => {
    const itemRequest = new StoreExecutionQuoteDetailsParams({
      quoteId: 94,
      stageId: 129,
      subStageId: 150,
      itemType: ExecutionQuoteItemSourceEnum.PRODUCT,
      items: [{ morphId: 17, expectedPrice: 0, quantity: 1, unit: 9 }],
    });
    const pricingDraft = new ExecutionQuoteStagePricingDraft({
      quoteStageId: 45,
      stageId: 129,
      subStageId: 150,
      quoteType: ExecutionQuoteTypeEnum.LUMP_SUM,
      pricingValue: 3500,
    });
    storeDetails.mockResolvedValue(new DataSuccess({ data: undefined }));
    setStagePricing.mockResolvedValue(new DataSuccess({ data: undefined }));

    const response = await ExecutionQuoteController.getInstance().storeBuilderChanges(
      [itemRequest],
      [pricingDraft],
      94,
      'quote-builder',
    );

    expect(response).toBeInstanceOf(DataSuccess);
    expect(storeDetails).toHaveBeenCalledWith(itemRequest);
    expect(setStagePricing.mock.calls[0]?.[0].toMap()).toEqual({
      quote_stage_id: 45,
      quote_type: ExecutionQuoteTypeEnum.LUMP_SUM,
      client_price: 3500,
    });
    expect(clearFormData).toHaveBeenCalledWith('quote-builder');
  });

  it('creates a new stage before resolving and saving its supervision percentage', async () => {
    const itemRequest = new StoreExecutionQuoteDetailsParams({
      quoteId: 94,
      stageId: 129,
      subStageId: 150,
      itemType: ExecutionQuoteItemSourceEnum.PRODUCT,
      items: [{ morphId: 17, expectedPrice: 0, quantity: 1, unit: 9 }],
    });
    const pricingDraft = new ExecutionQuoteStagePricingDraft({
      stageId: 129,
      subStageId: 150,
      quoteType: ExecutionQuoteTypeEnum.SUPERVISION,
      pricingValue: 10,
    });
    storeDetails.mockResolvedValue(new DataSuccess({ data: undefined }));
    show.mockResolvedValue(
      new DataSuccess({
        data: new ExecutionQuoteShowModel({
          id: 94,
          quoteStages: [{ id: 43, stageId: 129, subStageId: 150, items: [] }],
        }),
      }),
    );
    setStagePricing.mockResolvedValue(new DataSuccess({ data: undefined }));

    const response = await ExecutionQuoteController.getInstance().storeBuilderChanges(
      [itemRequest],
      [pricingDraft],
      94,
      'quote-builder',
    );

    expect(response).toBeInstanceOf(DataSuccess);
    expect(setStagePricing.mock.calls[0]?.[0].toMap()).toEqual({
      quote_stage_id: 43,
      quote_type: ExecutionQuoteTypeEnum.SUPERVISION,
      percentage: 10,
    });
    expect(clearFormData).toHaveBeenCalledWith('quote-builder');
  });

  it('returns the same singleton', () => {
    expect(ExecutionQuoteController.getInstance()).toBe(ExecutionQuoteController.getInstance());
  });

  it('stores details and clears only the submitted builder draft', async () => {
    const request = new StoreExecutionQuoteDetailsParams({
      quoteId: 94,
      stageId: 129,
      subStageId: 150,
      itemType: ExecutionQuoteItemSourceEnum.PRODUCT,
      items: [{ morphId: 17, expectedPrice: 0, quantity: 1, unit: 9 }],
    });
    storeDetails.mockResolvedValue(new DataSuccess({ data: undefined }));

    const response = await ExecutionQuoteController.getInstance().storeDetails(
      [request],
      '/organization/execution-quotes/add/stages/129?id=48',
    );

    expect(response).toBeInstanceOf(DataSuccess);
    expect(storeDetails).toHaveBeenCalledWith(request);
    expect(clearFormData).toHaveBeenCalledWith(
      '/organization/execution-quotes/add/stages/129?id=48',
    );
  });
});
