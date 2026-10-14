import { beforeEach, expect, it } from 'vitest';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { mockNetwork, response } from '../../../../SiteTeam/__tests__/network';
import Repository from '../purchase.order.repository';
import FetchParams from '../../../core/params/fetch.purchase.order.params';
import StoreParams from '../../../core/params/store.purchase.order.params';
import { orderRecord } from '../../../__tests__/order-fixtures';
let post: ReturnType<typeof mockNetwork>;
beforeEach(() => {
  post = mockNetwork();
});
it('keeps null Fetch as successful empty state and maps object Fetch', async () => {
  post.mockResolvedValue(response({ status: true, data: null }));
  const empty = await Repository.getInstance().show(new FetchParams(1));
  expect(empty).toBeInstanceOf(DataSuccess);
  expect(empty.data).toBeNull();
  post.mockResolvedValue(response({ status: true, data: orderRecord() }));
  expect(
    (await Repository.getInstance().show(new FetchParams(1))).data?.purchaseRequestPrice.price,
  ).toBe('1500.00');
});
it('does not invent persistence from opaque Store data', async () => {
  post.mockResolvedValue(response({ status: true, data: { arbitrary: 'opaque' } }));
  const saved = await Repository.getInstance().create(
    new StoreParams(1, 15, null, null, '2026-10-14'),
  );
  expect(saved).toBeInstanceOf(DataSuccess);
  expect(saved.data).toBeNull();
});
