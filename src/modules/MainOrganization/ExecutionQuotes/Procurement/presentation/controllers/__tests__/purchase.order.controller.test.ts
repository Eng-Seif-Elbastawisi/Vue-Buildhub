import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import {
  DataSuccess,
  DataCancelled,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import Controller from '../purchase.order.controller';
import Requests from '../purchase-request.controller';
import Prices from '../purchase-request-prices.controller';
import RequestModel from '../../../core/models/purchase-request.model';
import Params from '../../../core/params/store.purchase.order.params';
import { mockNetwork, response } from '../../../../SiteTeam/__tests__/network';
import { requestRecord } from '../../../__tests__/fixtures';
import { priceRecord } from '../../../__tests__/price-fixtures';
import { orderRecord } from '../../../__tests__/order-fixtures';
const controller = Controller.getInstance();
const requests = Requests.getInstance();
let post: ReturnType<typeof mockNetwork>;
let id = 20;
let status = 1;
let stored = false;
beforeEach(() => {
  id++;
  status = 1;
  stored = false;
  post = mockNetwork();
  requests.activate(140);
  requests.listState.value = new DataSuccess({
    data: [RequestModel.fromJson({ ...requestRecord(), id })],
  });
  controller.activate(140, id);
  post.mockImplementation(async (request) => {
    if (request.url.endsWith('/fetch_purchase_requests'))
      return response({ status: true, data: [{ ...requestRecord(), id, status }] });
    if (request.url.endsWith('/fetch_purchase_request_prices'))
      return response({ status: true, data: [priceRecord(3, 15, id)] });
    if (request.url.endsWith('/fetch_purchase_order'))
      return response({
        status: true,
        data: stored
          ? { ...orderRecord(), purchase_request: { ...orderRecord().purchase_request, id } }
          : null,
      });
    if (request.url.endsWith('/store_purchase_order')) {
      stored = true;
      status = 3;
      return response({ status: true });
    }
    throw new Error('Unexpected endpoint');
  });
});
afterEach(() => {
  controller.release();
  requests.release();
  Prices.getInstance().release();
  vi.restoreAllMocks();
});
const params = () => new Params(id, 15, 'Note', null, '2026-10-14');
it.each([1, 2, 3])(
  'allows Store only for Pending requests independently of Order Fetch: status %s',
  async (value) => {
    requests.listState.value = new DataSuccess({
      data: [RequestModel.fromJson({ ...requestRecord(), id, status: value })],
    });
    expect(controller.canStore.value).toBe(value === 1);
    await controller.fetchOne();
    expect(controller.canStore.value).toBe(value === 1);
  },
);
it('uses the offer record ID, refreshes authoritative state and blocks a second order', async () => {
  await controller.loadOffers();
  expect(await controller.create(new Params(id, 3, null, null, '2026-10-14'))).toBeInstanceOf(
    DataCancelled,
  );
  expect(post.mock.calls.some((call) => call[0].url.endsWith('/store_purchase_order'))).toBe(false);
  expect(await controller.create(params())).toBeInstanceOf(DataSuccess);
  expect(controller.fetchState.value.data?.purchaseRequest.id).toBe(id);
  expect(post.mock.calls.some((call) => call[0].url.endsWith('/fetch_purchase_order'))).toBe(true);
  expect(controller.refreshRequired.value).toBe(false);
  expect(requests.listState.value.data?.[0]?.status).toBe(3);
  expect(controller.canStore.value).toBe(false);
  await controller.create(params());
  const stores = post.mock.calls.filter((call) => call[0].url.endsWith('/store_purchase_order'));
  expect(stores).toHaveLength(1);
  expect(stores[0]?.[0].data).toEqual({
    purchase_request_id: id,
    purchase_request_price_id: 15,
    note: 'Note',
    date: '2026-10-14',
  });
});
it('keeps a confirmed order on the page until its authoritative read succeeds', async () => {
  const normal = post.getMockImplementation();
  if (!normal) throw new Error('Missing network mock');
  let orderReadFailed = true;
  post.mockImplementation((request) =>
    request.url.endsWith('/fetch_purchase_order') && orderReadFailed
      ? Promise.resolve(response({ status: false, message: 'Order unavailable' }))
      : normal(request),
  );
  expect(await controller.create(params())).toBeInstanceOf(DataSuccess);
  expect(controller.issued.value).toBe(true);
  expect(controller.refreshRequired.value).toBe(true);
  orderReadFailed = false;
  await controller.retryLastOperation();
  expect(controller.refreshRequired.value).toBe(false);
  expect(controller.fetchState.value.data?.purchaseRequest.id).toBe(id);
  expect(
    post.mock.calls.filter((call) => call[0].url.endsWith('/store_purchase_order')),
  ).toHaveLength(1);
});
it('existing order disables issue even if the request list is stale pending', async () => {
  stored = true;
  await controller.fetchOne();
  expect(controller.canStore.value).toBe(false);
});
it('rejects an offer belonging to a different request', async () => {
  const normal = post.getMockImplementation();
  if (!normal) throw new Error('Missing network mock');
  post.mockImplementation((request) =>
    request.url.endsWith('/fetch_purchase_request_prices')
      ? Promise.resolve(response({ status: true, data: [priceRecord(3, 15, id + 1)] }))
      : normal(request),
  );
  await controller.fetchOne();
  await controller.create(params());
  expect(controller.offersState.value.hasError).toBe(true);
  expect(post.mock.calls.some((call) => call[0].url.endsWith('/store_purchase_order'))).toBe(false);
});
it('rejects stale responses after switching requests or quotes', async () => {
  let resolve!: (value: ReturnType<typeof response>) => void;
  post.mockImplementationOnce(
    () =>
      new Promise((done) => {
        resolve = done;
      }),
  );
  const first = controller.fetchOne();
  controller.activate(140, id + 1);
  resolve(response({ status: true, data: orderRecord() }));
  expect(await first).toBeInstanceOf(DataCancelled);
  expect(controller.fetchState.value.data).toBeNull();
  controller.activate(140, id);
  post.mockImplementationOnce(
    () =>
      new Promise((done) => {
        resolve = done;
      }),
  );
  const second = controller.fetchOne();
  requests.activate(141);
  resolve(response({ status: true, data: orderRecord() }));
  expect(await second).toBeInstanceOf(DataCancelled);
});
it('prevents double submissions while preflight or Store is in flight', async () => {
  await controller.fetchOne();
  const first = controller.create(params());
  expect(await controller.create(params())).toBeInstanceOf(DataCancelled);
  await first;
  expect(
    post.mock.calls.filter((call) => call[0].url.endsWith('/store_purchase_order')),
  ).toHaveLength(1);
});
it('keeps successful Store separate from a failed request refresh and retry never fetches orders or reissues', async () => {
  const normal = post.getMockImplementation();
  if (!normal) throw new Error('Missing network mock');
  post.mockImplementation((request) =>
    request.url.endsWith('/fetch_purchase_requests') && stored
      ? Promise.resolve(response({ status: false, message: 'Details unavailable' }))
      : normal(request),
  );
  expect(await controller.create(params())).toBeInstanceOf(DataSuccess);
  expect(controller.issued.value).toBe(true);
  expect(requests.listState.value.hasError).toBe(true);
  expect(post.mock.calls.some((call) => call[0].url.endsWith('/fetch_purchase_order'))).toBe(false);
  expect(controller.itemState.value).toBeInstanceOf(DataSuccess);
  await controller.retryLastOperation();
  await controller.create(params());
  expect(
    post.mock.calls.filter((call) => call[0].url.endsWith('/store_purchase_order')),
  ).toHaveLength(1);
});
it('does not replay an unverified Store envelope even after reopening', async () => {
  const normal = post.getMockImplementation();
  if (!normal) throw new Error('Missing network mock');
  post.mockImplementation((request) =>
    request.url.endsWith('/store_purchase_order')
      ? Promise.resolve(response({ message: 'Unknown outcome' }))
      : normal(request),
  );
  await controller.fetchOne();
  await controller.create(params());
  expect(controller.refreshRequired.value).toBe(true);
  controller.activate(140, id);
  await controller.refreshForStore();
  await controller.create(params());
  expect(controller.canStore.value).toBe(false);
  expect(
    post.mock.calls.filter((call) => call[0].url.endsWith('/store_purchase_order')),
  ).toHaveLength(1);
});
it.each([2, 3])(
  'locks all supplier price mutations for status %s without hiding saved offers',
  async (value) => {
    requests.listState.value = new DataSuccess({
      data: [RequestModel.fromJson({ ...requestRecord(), id, status: value })],
    });
    const prices = Prices.getInstance();
    prices.activate(140, id);
    await prices.fetchList();
    const original = prices.draft.value;
    prices.addSupplier();
    const row = original[0];
    if (!row) throw new Error('Missing saved offer');
    prices.updateRow(row.key, { price: '1' });
    prices.removeSupplier(row.key);
    await prices.save();
    expect(prices.readOnly.value).toBe(true);
    expect(prices.savedOffers.value).toHaveLength(1);
    expect(prices.draft.value).toEqual(original);
    expect(
      post.mock.calls.some((call) => call[0].url.endsWith('/store_purchase_request_prices')),
    ).toBe(false);
  },
);

it('keeps the Store lock across request switches and discards its late result', async () => {
  requests.listState.value = new DataSuccess({
    data: [id, id + 1].map((value) => RequestModel.fromJson({ ...requestRecord(), id: value })),
  });
  const normal = post.getMockImplementation();
  if (!normal) throw new Error('Missing network mock');
  let resolve!: (value: ReturnType<typeof response>) => void;
  post.mockImplementation((request) =>
    request.url.endsWith('/store_purchase_order')
      ? new Promise((done) => {
          resolve = done;
        })
      : normal(request),
  );
  await controller.fetchOne();
  const issuing = controller.create(params());
  await vi.waitFor(() =>
    expect(post.mock.calls.some((call) => call[0].url.endsWith('/store_purchase_order'))).toBe(
      true,
    ),
  );
  requests.listState.value = new DataSuccess({
    data: [id, id + 1].map((value) => RequestModel.fromJson({ ...requestRecord(), id: value })),
  });
  controller.activate(140, id + 1);
  expect(controller.isIssuing.value).toBe(true);
  expect(await controller.create(new Params(id + 1, 15, null, null, '2026-10-14'))).toBeInstanceOf(
    DataCancelled,
  );
  resolve(response({ status: true }));
  expect(await issuing).toBeInstanceOf(DataCancelled);
  expect(controller.issued.value).toBe(false);
  expect(controller.itemState.value.data).toBeNull();
  controller.activate(140, id);
  await controller.fetchOne();
  expect(controller.canStore.value).toBe(false);
});

it('discards stale offer reads when switching requests', async () => {
  let resolve!: (value: ReturnType<typeof response>) => void;
  post.mockImplementationOnce(
    () =>
      new Promise((done) => {
        resolve = done;
      }),
  );
  const loading = controller.loadOffers();
  controller.activate(140, id + 1);
  resolve(response({ status: true, data: [priceRecord(3, 15, id)] }));
  await loading;
  expect(controller.offersState.value.data).toBeNull();
});
