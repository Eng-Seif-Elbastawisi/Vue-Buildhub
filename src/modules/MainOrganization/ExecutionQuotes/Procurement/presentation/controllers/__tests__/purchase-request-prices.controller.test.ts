import { afterEach, beforeEach, expect, it } from 'vitest';
import TitleInterface from '@/base/Data/Models/titleInterface';
import {
  DataCancelled,
  DataSuccess,
  DataFailed,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { mockNetwork, response } from '../../../../SiteTeam/__tests__/network';
import { activatePurchaseRequests, priceRecord } from '../../../__tests__/price-fixtures';
import PurchaseRequestPricesController from '../purchase-request-prices.controller';
import PurchaseRequestController from '../purchase-request.controller';
import IndexSuppliersParams from '@/modules/MainOrganization/Suppliers/core/params/index.Suppliers.params';
const controller = PurchaseRequestPricesController.getInstance();
let post: ReturnType<typeof mockNetwork>;
beforeEach(() => {
  post = mockNetwork();
  activatePurchaseRequests();
  controller.activate(140, 1);
  post.mockResolvedValue(
    response({ status: true, data: [priceRecord(3, 15), priceRecord(4, 16)] }),
  );
});
afterEach(() => {
  controller.release();
  PurchaseRequestController.getInstance().release();
});
function stores() {
  return post.mock.calls.filter((call) => call[0].url.includes('store_purchase_request_prices'));
}
function draftRow(index: number) {
  const row = controller.draft.value[index];
  if (!row) throw new Error('Missing supplier offer row');
  return row;
}
function editFirst(price = '200.25') {
  controller.updateRow(draftRow(0).key, { price });
}
it('prefills actual supplier IDs, decimal strings, durations and units', async () => {
  await controller.fetchList();
  expect(controller.loaded.value).toBe(true);
  expect(controller.draft.value[0]).toMatchObject({
    supplier: { id: 3, title: 'Supplier 3' },
    price: '1500.00',
    duration: '2',
    durationType: { id: 2 },
  });
  expect(controller.dirty.value).toBe(false);
  expect(post.mock.calls[0]?.[0].data).toEqual({ purchase_request_id: 1 });
});
it('preserves every other saved offer when editing one price and refetches authoritative values', async () => {
  await controller.fetchList();
  editFirst();
  post.mockImplementation(async (request) =>
    response(
      request.url.includes('store_')
        ? { status: true }
        : { status: true, data: [{ ...priceRecord(3, 15), price: '200.25' }, priceRecord(4, 16)] },
    ),
  );
  expect(await controller.save()).toBeInstanceOf(DataSuccess);
  expect(stores()[0]?.[0].data).toEqual({
    purchase_request_id: 1,
    suppliers: [
      { id: 3, price: 200.25, duration: 2, duration_type: 2 },
      { id: 4, price: 1500, duration: 2, duration_type: 2 },
    ],
  });
  expect(controller.confirmationVisible.value).toBe(false);
  expect(controller.draft.value[0]?.price).toBe('200.25');
  expect(controller.dirty.value).toBe(false);
});
it('adding a supplier retains all existing offers and prevents duplicate selection', async () => {
  await controller.fetchList();
  controller.addSupplier();
  const row = draftRow(controller.draft.value.length - 1);
  controller.updateRow(row.key, { supplier: new TitleInterface({ id: 3, title: 'Supplier 3' }) });
  expect(controller.draft.value.at(-1)?.supplier).toBeNull();
  controller.updateRow(row.key, {
    supplier: new TitleInterface({ id: 5, title: 'New Supplier' }),
    price: '10.50',
    duration: '5',
    durationType: new TitleInterface({ id: 1, title: 'Day' }),
  });
  post.mockImplementation(async (request) =>
    response(
      request.url.includes('store_')
        ? { status: true }
        : { status: true, data: [priceRecord(3, 15), priceRecord(4, 16), priceRecord(5, 17)] },
    ),
  );
  await controller.save();
  expect(stores()[0]?.[0].data?.suppliers).toEqual([
    { id: 3, price: 1500, duration: 2, duration_type: 2 },
    { id: 4, price: 1500, duration: 2, duration_type: 2 },
    { id: 5, price: 10.5, duration: 5, duration_type: 1 },
  ]);
});
it.each([false, true])('requires explicit removal confirmation (clearAll=%s)', async (clearAll) => {
  await controller.fetchList();
  const rows = controller.draft.value.slice();
  const secondKey = rows[1]?.key;
  if (secondKey === undefined) throw new Error('Missing second offer');
  controller.removeSupplier(draftRow(0).key);
  if (clearAll) controller.removeSupplier(secondKey);
  await controller.save();
  expect(controller.confirmationVisible.value).toBe(true);
  expect(controller.removedOffers.value.map((offer) => offer.supplier?.id)).toEqual(
    clearAll ? [3, 4] : [3],
  );
  expect(stores()).toHaveLength(0);
  post.mockImplementation(async (request) =>
    response(
      request.url.includes('store_')
        ? { status: true }
        : { status: true, data: clearAll ? [] : [priceRecord(4, 16)] },
    ),
  );
  await controller.confirmSave();
  expect(stores()[0]?.[0].data).toEqual({
    purchase_request_id: 1,
    suppliers: clearAll ? [] : [{ id: 4, price: 1500, duration: 2, duration_type: 2 }],
  });
});
it('cancelling removal preserves draft and does not touch Supplier master records', async () => {
  await controller.fetchList();
  controller.removeSupplier(draftRow(0).key);
  await controller.save();
  controller.cancelConfirmation();
  expect(controller.draft.value.map((row) => row.supplier?.id)).toEqual([4]);
  expect(stores()).toHaveLength(0);
  expect(post.mock.calls.some((call) => /delete|remove/.test(call[0].url))).toBe(false);
});
it('failed fetch cannot trigger empty sync, while successful empty fetch allows adding', async () => {
  post.mockResolvedValue(response({ status: false, message: 'Denied' }));
  await controller.fetchList();
  await controller.save();
  expect(controller.loaded.value).toBe(false);
  expect(stores()).toHaveLength(0);
  post.mockResolvedValue(response({ status: true, data: [] }));
  await controller.fetchList();
  expect(controller.loaded.value).toBe(true);
  controller.addSupplier();
  expect(controller.draft.value).toHaveLength(1);
});
it.each([{ status: false, message: 'Invalid price' }, { success: true }])(
  'failed/unconfirmed Store preserves all edits for %j',
  async (body) => {
    await controller.fetchList();
    editFirst();
    post.mockResolvedValue(response(body));
    expect(await controller.save()).toBeInstanceOf(DataFailed);
    expect(controller.draft.value).toHaveLength(2);
    expect(controller.draft.value[0]?.price).toBe('200.25');
    expect(stores()).toHaveLength(1);
    expect(controller.dirty.value).toBe(true);
  },
);
it('Sync success with refresh failure blocks another submission and exposes safe read retry', async () => {
  await controller.fetchList();
  editFirst();
  post.mockImplementation(async (request) =>
    response(
      request.url.includes('store_') ? { status: true } : { status: false, message: 'Read failed' },
    ),
  );
  expect(await controller.save()).toBeInstanceOf(DataSuccess);
  expect(controller.refreshRequired.value).toBe(true);
  expect(controller.canSave.value).toBe(false);
  await controller.save();
  expect(stores()).toHaveLength(1);
  post.mockResolvedValue(
    response({
      status: true,
      data: [{ ...priceRecord(3, 15), price: '200.25' }, priceRecord(4, 16)],
    }),
  );
  await controller.retryLastOperation();
  expect(stores()).toHaveLength(1);
  expect(controller.refreshRequired.value).toBe(false);
  expect(controller.dirty.value).toBe(false);
});
it('ignores stale reads when switching Purchase Requests in the same Quote', async () => {
  let finish!: (value: ReturnType<typeof response>) => void;
  post.mockReturnValueOnce(
    new Promise((resolve) => {
      finish = resolve;
    }),
  );
  const old = controller.fetchList();
  controller.activate(140, 2);
  post.mockResolvedValue(response({ status: true, data: [priceRecord(5, 17, 2)] }));
  await controller.fetchList();
  finish(response({ status: true, data: [priceRecord()] }));
  expect(await old).toBeInstanceOf(DataCancelled);
  expect(controller.draft.value[0]?.supplier?.id).toBe(5);
});
it('rejects unknown Quote/request ownership and foreign Fetch records', async () => {
  expect(controller.activate(140, 99)).toBe(false);
  await controller.fetchList();
  expect(post).not.toHaveBeenCalled();
  controller.activate(140, 1);
  post.mockResolvedValue(response({ status: true, data: [priceRecord(3, 15, 2)] }));
  expect(await controller.fetchList()).toBeInstanceOf(DataFailed);
  expect(controller.loaded.value).toBe(false);
});
it('blocks incomplete saved supplier relations from complete-list replacement', async () => {
  post.mockResolvedValue(response({ status: true, data: [{ ...priceRecord(), supplier: null }] }));
  await controller.fetchList();
  await controller.save();
  expect(controller.loaded.value).toBe(false);
  expect(stores()).toHaveLength(0);
});
it('prevents overlapping Sync and ignores a previous request mutation result', async () => {
  await controller.fetchList();
  editFirst();
  let finish!: (value: ReturnType<typeof response>) => void;
  post.mockReturnValueOnce(
    new Promise((resolve) => {
      finish = resolve;
    }),
  );
  const saving = controller.save();
  await controller.save();
  expect(stores()).toHaveLength(1);
  controller.activate(140, 2);
  finish(response({ status: true }));
  expect(await saving).toBeInstanceOf(DataCancelled);
  expect(controller.purchaseRequestId.value).toBe(2);
  expect(controller.draft.value).toEqual([]);
  expect(controller.confirmedSync.value).toBe(false);
});
it('validates decimals and integer duration before transport', async () => {
  await controller.fetchList();
  controller.updateRow(draftRow(0).key, {
    price: '9007199254740993',
    duration: '2.5',
  });
  await controller.save();
  expect(controller.errors.value.map((error) => error.field)).toEqual(
    expect.arrayContaining(['suppliers.0.price', 'suppliers.0.duration']),
  );
  expect(stores()).toHaveLength(0);
});
it('reuses existing Supplier search and pagination without additional owner IDs', async () => {
  post.mockResolvedValue(
    response({
      status: true,
      data: {
        data: [{ id: 3, name: 'ABC Supplier' }],
        meta: { current_page: 2, last_page: 3, per_page: 10, total: 25 },
      },
    }),
  );
  const lookup = controller.createSupplierLookup();
  expect(await lookup.fetchAsOptions(new IndexSuppliersParams('ABC', 2))).toEqual([
    new TitleInterface({ id: 3, title: 'ABC Supplier' }),
  ]);
  expect(post.mock.calls[0]?.[0]).toMatchObject({
    url: expect.stringContaining('fetch_suppliers'),
    data: expect.objectContaining({ word: 'ABC', page: 2, with_pagination: 1 }),
  });
  expect(lookup.pagination.value?.lastPage).toBe(3);
});
it('rejects stale Supplier lookup results after Quote ownership changes', async () => {
  let finish!: (value: ReturnType<typeof response>) => void;
  post.mockReturnValueOnce(
    new Promise((resolve) => {
      finish = resolve;
    }),
  );
  const lookup = controller.createSupplierLookup();
  const fetching = lookup.fetchAsOptions(new IndexSuppliersParams('ABC'));
  PurchaseRequestController.getInstance().activate(141);
  finish(response({ status: true, data: [{ id: 3, name: 'ABC Supplier' }] }));
  expect(await fetching).toEqual([]);
  expect(lookup.isListSuccess()).toBe(false);
});
it('ignores stale offer Fetch data after switching Quotes', async () => {
  let finish!: (value: ReturnType<typeof response>) => void;
  post.mockReturnValueOnce(
    new Promise((resolve) => {
      finish = resolve;
    }),
  );
  const fetching = controller.fetchList();
  PurchaseRequestController.getInstance().activate(141);
  controller.release();
  finish(response({ status: true, data: [priceRecord()] }));
  expect(await fetching).toBeInstanceOf(DataCancelled);
  expect(controller.draft.value).toEqual([]);
  expect(controller.loaded.value).toBe(false);
});
it('requires read verification after an unconfirmed Sync without discarding the failed draft', async () => {
  await controller.fetchList();
  editFirst('200.25');
  post.mockResolvedValue(response({ success: true }));
  await controller.save();
  expect(controller.refreshRequired.value).toBe(true);
  await controller.save();
  expect(stores()).toHaveLength(1);
  post.mockResolvedValue(
    response({ status: true, data: [priceRecord(3, 15), priceRecord(4, 16)] }),
  );
  await controller.retryLastOperation();
  expect(controller.refreshRequired.value).toBe(false);
  expect(controller.draft.value[0]?.price).toBe('200.25');
  expect(stores()).toHaveLength(1);
});
it('authoritative verification marks an already persisted draft clean without encouraging another Sync', async () => {
  await controller.fetchList();
  editFirst('200.25');
  post.mockResolvedValue(response({ success: true }));
  await controller.save();
  post.mockResolvedValue(
    response({
      status: true,
      data: [{ ...priceRecord(3, 15), price: '200.25' }, priceRecord(4, 16)],
    }),
  );
  await controller.retryLastOperation();
  expect(controller.dirty.value).toBe(false);
  expect(controller.canSave.value).toBe(false);
  expect(controller.draft.value[0]?.price).toBe('200.25');
  await controller.save();
  expect(stores()).toHaveLength(1);
});
