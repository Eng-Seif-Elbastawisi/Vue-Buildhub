import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  DataFailed,
  DataSuccess,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import IndexParams from '@/base/Core/Params/indexParams';

import { QuoteStatusEnum } from '../../../core/constants/quote.status.enum';
import ChangeQuoteStatusParams from '../../../core/params/change.quote.status.params';
import DeleteExecutionQuoteItemParams from '../../../core/params/delete.execution.quote.item.params';
import ExecutionQuoteRepository from '../execution.quote.repository';

const {
  changeQuoteStatus,
  deleteExecutionQuoteItem,
  index,
  setStagePricing,
  setSupervisionPricing,
  storeDetails,
} = vi.hoisted(() => ({
  changeQuoteStatus: vi.fn(),
  deleteExecutionQuoteItem: vi.fn(),
  index: vi.fn(),
  setStagePricing: vi.fn(),
  setSupervisionPricing: vi.fn(),
  storeDetails: vi.fn(),
}));

vi.mock('../../api/execution.quote.api-service', () => ({
  default: {
    getInstance: () => ({
      changeQuoteStatus,
      deleteExecutionQuoteItem,
      index,
      setStagePricing,
      setSupervisionPricing,
      storeDetails,
    }),
  },
}));

describe('ExecutionQuoteRepository', () => {
  beforeEach(() => {
    changeQuoteStatus.mockReset();
    deleteExecutionQuoteItem.mockReset();
    index.mockReset();
    setStagePricing.mockReset();
    setSupervisionPricing.mockReset();
    storeDetails.mockReset();
  });

  it('returns the same singleton', () => {
    expect(ExecutionQuoteRepository.getInstance()).toBe(ExecutionQuoteRepository.getInstance());
  });

  it('maps Laravel pagination metadata from the nested quotes response', async () => {
    index.mockResolvedValue({
      statusCode: 200,
      data: {
        status: true,
        data: {
          data: [{ id: 37, quote_source: 1 }],
          links: {
            first: 'quotes?page=1',
            last: 'quotes?page=2',
            prev: null,
            next: 'quotes?page=2',
          },
          meta: {
            current_page: 1,
            from: 1,
            last_page: 2,
            per_page: 20,
            to: 1,
            total: 21,
          },
        },
      },
    });

    const response = await ExecutionQuoteRepository.getInstance().index(
      new IndexParams('', 1, 20, 1),
    );

    expect(response).toBeInstanceOf(DataSuccess);
    expect(response.data?.[0]?.id).toBe(37);
    expect(response.pagination).toMatchObject({
      currentPage: 1,
      from: 1,
      lastPage: 2,
      perPage: 20,
      to: 1,
      total: 21,
    });
  });

  it('maps a successful details response to DataSuccess', async () => {
    storeDetails.mockResolvedValue({
      statusCode: 201,
      data: { status: true, message: 'Saved' },
    });

    const response = await ExecutionQuoteRepository.getInstance().storeDetails();

    expect(response).toBeInstanceOf(DataSuccess);
    expect(response.message).toBe('Saved');
  });

  it('maps a rejected details response to DataFailed', async () => {
    storeDetails.mockResolvedValue({
      statusCode: 200,
      data: { status: false, message: 'Rejected' },
    });

    const response = await ExecutionQuoteRepository.getInstance().storeDetails();

    expect(response).toBeInstanceOf(DataFailed);
    expect(response.error?.title).toBe('Rejected');
  });

  it('maps a successful stage-pricing response to DataSuccess', async () => {
    setStagePricing.mockResolvedValue({
      statusCode: 200,
      data: { status: true, message: 'Pricing saved' },
    });

    const response = await ExecutionQuoteRepository.getInstance().setStagePricing();

    expect(response).toBeInstanceOf(DataSuccess);
    expect(response.message).toBe('Pricing saved');
  });

  it('accepts a no-content item deletion response', async () => {
    deleteExecutionQuoteItem.mockResolvedValue({ statusCode: 204, data: undefined });

    const response = await ExecutionQuoteRepository.getInstance().deleteExecutionQuoteItem(
      new DeleteExecutionQuoteItemParams({ quoteItemId: 15 }),
    );

    expect(response).toBeInstanceOf(DataSuccess);
  });

  it('maps a successful supervision-pricing response to DataSuccess', async () => {
    setSupervisionPricing.mockResolvedValue({
      statusCode: 200,
      data: { status: true, message: 'Supervision pricing saved' },
    });

    const response = await ExecutionQuoteRepository.getInstance().setSupervisionPricing();

    expect(response).toBeInstanceOf(DataSuccess);
    expect(response.message).toBe('Supervision pricing saved');
  });

  it('maps a successful quote-status response to DataSuccess', async () => {
    changeQuoteStatus.mockResolvedValue({
      statusCode: 200,
      data: { status: true, message: 'Status changed' },
    });

    const response = await ExecutionQuoteRepository.getInstance().changeQuoteStatus(
      new ChangeQuoteStatusParams({
        quoteId: 141,
        status: QuoteStatusEnum.PENDING_VALIDATION,
      }),
    );

    expect(response).toBeInstanceOf(DataSuccess);
    expect(response.message).toBe('Status changed');
  });
});
