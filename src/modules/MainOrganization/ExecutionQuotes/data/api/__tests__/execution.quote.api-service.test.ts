import type { AxiosResponse } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import NetworkService from '@/base/Core/NetworkStructure/networking/networkService';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';

import { ExecutionQuoteItemSourceEnum } from '../../../core/constants/execution.quote.item.source.enum';
import { QuoteStatusEnum } from '../../../core/constants/quote.status.enum';
import ChangeQuoteStatusParams from '../../../core/params/change.quote.status.params';
import DeleteExecutionQuoteItemParams from '../../../core/params/delete.execution.quote.item.params';
import FetchQuoteStatusHistoryParams from '../../../core/params/fetch.quote.status.history.params';
import UpdateExecutionQuoteItemParams from '../../../core/params/update.execution.quote.item.params';
import ExecutionQuoteRepository from '../../repositories/execution.quote.repository';
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

  it('updates an item through update_quote_stage_item with the full row payload', async () => {
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
        url: expect.stringMatching(/\/(?:organization|mainportal)\/update_quote_stage_item$/),
        data: {
          quote_stage_item_id: 15,
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

  it('deletes an item through delete_quote_stage_item', async () => {
    postRequest.mockResolvedValue({
      status: 200,
      data: { status: true },
      headers: {},
    } as AxiosResponse);

    await service.deleteExecutionQuoteItem(new DeleteExecutionQuoteItemParams({ quoteItemId: 15 }));

    expect(postRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringMatching(/\/(?:organization|mainportal)\/delete_quote_stage_item$/),
        data: { quote_stage_item_id: 15 },
        isAuth: true,
      }),
      expect.any(Object),
    );
  });

  it('changes the quote status through the dedicated endpoint', async () => {
    postRequest.mockResolvedValue({
      status: 200,
      data: { status: true },
      headers: {},
    } as AxiosResponse);

    await service.changeQuoteStatus(
      new ChangeQuoteStatusParams({
        quoteId: 141,
        status: QuoteStatusEnum.PENDING_VALIDATION,
        note: 'Ready for validation',
      }),
    );

    expect(postRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringMatching(/\/(?:organization|mainportal)\/change_quote_status$/),
        data: {
          quote_id: 141,
          status: QuoteStatusEnum.PENDING_VALIDATION,
          note: 'Ready for validation',
        },
        isAuth: true,
      }),
      expect.any(Object),
    );
  });

  it('maps the wrapped quote status history returned for quote_id', async () => {
    postRequest.mockResolvedValue({
      status: 200,
      data: {
        status: true,
        message: 'تم جلب سجل حالات المقايسة بنجاح.',
        data: [
          {
            id: 3,
            employee: { id: 1, name: 'Techlab Employee' },
            from_status: QuoteStatusEnum.DRAFT,
            to_status: QuoteStatusEnum.PENDING_VALIDATION,
            note: null,
            created_at: '2026-09-30 07:50:08',
          },
        ],
      },
      headers: {},
    } as AxiosResponse);

    const response = await ExecutionQuoteRepository.getInstance().fetchQuoteStatusHistory(
      new FetchQuoteStatusHistoryParams({ quoteId: 143 }),
    );

    expect(postRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringMatching(/\/(?:organization|mainportal)\/fetch_quote_status_history$/),
        data: { quote_id: 143 },
        isAuth: true,
      }),
      expect.any(Object),
    );
    expect(response).toBeInstanceOf(DataSuccess);
    expect(response.message).toBe('تم جلب سجل حالات المقايسة بنجاح.');
    expect(response.data?.[0]).toMatchObject({
      id: 3,
      employee: { id: 1, name: 'Techlab Employee' },
      fromStatus: QuoteStatusEnum.DRAFT,
      toStatus: QuoteStatusEnum.PENDING_VALIDATION,
      note: null,
    });
  });
});
