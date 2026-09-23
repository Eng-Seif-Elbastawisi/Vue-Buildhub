import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  DataFailed,
  DataSuccess,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';

import ExecutionQuoteRepository from '../execution.quote.repository';

const { storeDetails } = vi.hoisted(() => ({
  storeDetails: vi.fn(),
}));

vi.mock('../../api/execution.quote.api-service', () => ({
  default: { getInstance: () => ({ storeDetails }) },
}));

describe('ExecutionQuoteRepository', () => {
  beforeEach(() => {
    storeDetails.mockReset();
  });

  it('returns the same singleton', () => {
    expect(ExecutionQuoteRepository.getInstance()).toBe(ExecutionQuoteRepository.getInstance());
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
