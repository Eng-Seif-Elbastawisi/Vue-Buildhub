import { beforeEach, expect, it } from 'vitest';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { mockNetwork, response } from '../../../../SiteTeam/__tests__/network';
import { stockRecord } from '../../../__tests__/disbursement-fixtures';
import DisbursementStockModel from '../../../core/models/disbursement-stock.model';
import FetchDisbursementStockParams from '../../../core/params/fetch-disbursement-stock.params';
import MaterialDisbursementRepository from '../material-disbursement.repository';

let post: ReturnType<typeof mockNetwork>;
beforeEach(() => {
  post = mockNetwork();
});

it('maps stock directly from data and keeps decimal strings', async () => {
  post.mockResolvedValue(response({ status: true, data: [stockRecord()] }));
  const result = await MaterialDisbursementRepository.getInstance().index(
    new FetchDisbursementStockParams(140),
  );
  expect(result).toBeInstanceOf(DataSuccess);
  expect(result.data?.[0]).toBeInstanceOf(DisbursementStockModel);
  expect(result.data?.[0]?.availableQuantity).toBe('4.00');
});

it('represents an empty stock response as an empty array', async () => {
  post.mockResolvedValue(response({ status: true, data: [] }));
  const result = await MaterialDisbursementRepository.getInstance().index(
    new FetchDisbursementStockParams(140),
  );
  expect(result.data).toEqual([]);
});
