import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  DataFailed,
  DataSuccess,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import IndexParams from '@/base/Core/Params/indexParams';

import ExecutionQuoteRepository from '../execution.quote.repository';

const { index, storeDetails } = vi.hoisted(() => ({
  index: vi.fn(),
  storeDetails: vi.fn(),
}));

vi.mock('../../api/execution.quote.api-service', () => ({
  default: { getInstance: () => ({ index, storeDetails }) },
}));

describe('ExecutionQuoteRepository', () => {
  beforeEach(() => {
    index.mockReset();
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
});
