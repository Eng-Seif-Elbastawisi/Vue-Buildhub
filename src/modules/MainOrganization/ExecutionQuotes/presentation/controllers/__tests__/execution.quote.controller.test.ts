import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';

import { ExecutionQuoteItemSourceEnum } from '../../../core/constants/execution.quote.item.source.enum';
import StoreExecutionQuoteDetailsParams from '../../../core/params/store.execution.quote.details.params';
import ExecutionQuoteController from '../execution.quote.controller';

const { clearFormData, storeDetails } = vi.hoisted(() => ({
  clearFormData: vi.fn(),
  storeDetails: vi.fn(),
}));

vi.mock('@/stores/formsStore', () => ({
  useFormsStore: () => ({ clearFormData }),
}));

vi.mock('../../../data/repositories/execution.quote.repository', () => ({
  default: { getInstance: () => ({ storeDetails }) },
}));

describe('ExecutionQuoteController', () => {
  beforeEach(() => {
    clearFormData.mockReset();
    storeDetails.mockReset();
  });

  it('returns the same singleton', () => {
    expect(ExecutionQuoteController.getInstance()).toBe(ExecutionQuoteController.getInstance());
  });

  it('stores details and clears only the submitted builder draft', async () => {
    const request = new StoreExecutionQuoteDetailsParams({
      quoteId: 48,
      stageId: 129,
      subStageId: 150,
      itemType: ExecutionQuoteItemSourceEnum.PRODUCT,
      clientPrice: 950,
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
