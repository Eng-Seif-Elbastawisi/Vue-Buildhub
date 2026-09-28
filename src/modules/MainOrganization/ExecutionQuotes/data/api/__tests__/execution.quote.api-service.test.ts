import type { AxiosResponse } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import NetworkService from '@/base/Core/NetworkStructure/networking/networkService';

import { ExecutionQuoteItemSourceEnum } from '../../../core/constants/execution.quote.item.source.enum';
import DeleteExecutionQuoteItemParams from '../../../core/params/delete.execution.quote.item.params';
import UpdateExecutionQuoteItemParams from '../../../core/params/update.execution.quote.item.params';
import ExecutionQuoteApiService from '../execution.quote.api-service';

describe('ExecutionQuoteApiService', () => {
  const service = ExecutionQuoteApiService.getInstance();
  const postRequest = vi.spyOn(NetworkService.instance, 'post');

  beforeEach(() => {
    postRequest.mockReset();
  });

  it('returns the same singleton', () => {
    expect(service).toBe(ExecutionQuoteApiService.getInstance());
  });

  it('updates an item through edit_quote_item with the full row payload', async () => {
    const params = new UpdateExecutionQuoteItemParams({
      quoteItemId: 15,
      itemType: ExecutionQuoteItemSourceEnum.PRODUCT,
      morphId: 17,
      expectedPrice: 125,
      quantity: 3,
      unit: 165,
    });
    postRequest.mockResolvedValue({
      status: 200,
      data: { status: true },
      headers: {},
    } as AxiosResponse);

    await service.updateExecutionQuoteItem(params);

    expect(postRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringMatching(/\/(?:organization|mainportal)\/edit_quote_item$/),
        data: {
          quote_item_id: 15,
          item_type: ExecutionQuoteItemSourceEnum.PRODUCT,
          morph_id: 17,
          expected_price: 125,
          quantity: 3,
          unit: 165,
        },
        isAuth: true,
      }),
      expect.any(Object),
    );
  });

  it('deletes an item through delete_quote_item', async () => {
    postRequest.mockResolvedValue({
      status: 200,
      data: { status: true },
      headers: {},
    } as AxiosResponse);

    await service.deleteExecutionQuoteItem(new DeleteExecutionQuoteItemParams({ quoteItemId: 15 }));

    expect(postRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringMatching(/\/(?:organization|mainportal)\/delete_quote_item$/),
        data: { quote_item_id: 15 },
        isAuth: true,
      }),
      expect.any(Object),
    );
  });
});
