import { expect, it } from 'vitest';
import FetchDisbursementStockParams from '../fetch-disbursement-stock.params';

it('scopes stock fetching by the selected quote', () => {
  const params = new FetchDisbursementStockParams(140);
  expect(params.toMap()).toEqual({ quote_id: 140 });
  expect(params.validate().isValid).toBe(true);
  expect(new FetchDisbursementStockParams(0).validate().isValid).toBe(false);
});
