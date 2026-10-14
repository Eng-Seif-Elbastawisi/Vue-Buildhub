import { beforeEach, expect, it } from 'vitest';
import {
  DataSuccess,
  DataFailed,
  DataTimeout,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { RequestTimeoutException } from '@/base/Core/Constants/exceptionConstants';
import { mockNetwork, response } from '../../../../SiteTeam/__tests__/network';
import PurchaseRequestPricesRepository from '../purchase-request-prices.repository';
import PurchaseRequestPriceModel from '../../../core/models/purchase-request.price.model';
import FetchPurchaseRequestPricesParams from '../../../core/params/fetch.purchase-request-prices.params';
import StorePurchaseRequestPricesParams from '../../../core/params/store.purchase-request-prices.params';
import { priceRecord } from '../../../__tests__/price-fixtures';
let post: ReturnType<typeof mockNetwork>;
const repository = PurchaseRequestPricesRepository.getInstance();
beforeEach(() => {
  post = mockNetwork();
});
it('maps the complete unpaginated array', async () => {
  post.mockResolvedValue(response({ status: true, data: [priceRecord()] }));
  const state = await repository.index(new FetchPurchaseRequestPricesParams(1));
  expect(state).toBeInstanceOf(DataSuccess);
  expect(state.data?.[0]).toBeInstanceOf(PurchaseRequestPriceModel);
  expect(state.data?.[0]?.price).toBe('1500.00');
  expect(state.pagination).toBeNull();
});
it('accepts the authoritative empty list', async () => {
  post.mockResolvedValue(response({ status: true, data: [] }));
  const state = await repository.index(new FetchPurchaseRequestPricesParams(1));
  expect(state).toBeInstanceOf(DataSuccess);
  expect(state.data).toBeNull();
});
it.each([
  { data: [priceRecord()] },
  { status: true, data: [priceRecord()], meta: { last_page: 2 } },
  { status: true, data: {} },
  { status: true, message: 'fetched successfully', data: [{ ...priceRecord(), price: 12 }] },
  { status: true, data: [priceRecord(), priceRecord(3, 16)] },
])('rejects malformed or duplicate collections %j', async (body) => {
  post.mockResolvedValue(response(body));
  const state = await repository.index(new FetchPurchaseRequestPricesParams(1));
  expect(state).toBeInstanceOf(DataFailed);
  expect(state.error?.displayMessage).not.toBe('fetched successfully');
});
it.each([{ success: true }, { data: { id: 17 } }, { status: false, message: 'Denied' }])(
  'does not invent persistence for %j',
  async (body) => {
    post.mockResolvedValue(response(body));
    expect(await repository.create(new StorePurchaseRequestPricesParams(1, []))).toBeInstanceOf(
      DataFailed,
    );
  },
);
it('treats confirmed Store data as opaque and never invents offer IDs', async () => {
  post.mockResolvedValue(response({ status: true, data: { unknown: 15 } }));
  const state = await repository.create(new StorePurchaseRequestPricesParams(1, []));
  expect(state).toBeInstanceOf(DataSuccess);
  expect(state.data).toBeNull();
});
it('never retries a timed-out synchronization', async () => {
  post.mockRejectedValue(new RequestTimeoutException());
  const state = await repository.create(new StorePurchaseRequestPricesParams(1, []));
  expect(state).toBeInstanceOf(DataTimeout);
  if (!(state instanceof DataTimeout)) throw new Error('Expected timeout');
  expect(await state.retry()).toBeNull();
  expect(post).toHaveBeenCalledOnce();
});
