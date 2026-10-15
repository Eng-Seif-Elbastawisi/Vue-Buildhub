import { beforeEach, expect, it, vi } from 'vitest';
import {
  DataInitial,
  DataSuccess,
  DataFailed,
  DataCancelled,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { ErrorModel, ErrorType } from '@/base/Core/NetworkStructure/Resources/errors/errorModel';
import PurchaseRequestModel from '../../../../Procurement/core/models/purchase-request.model';
import { requestRecord } from '../../../../Procurement/__tests__/fixtures';
import PurchaseRequestRepository from '../../../../Procurement/data/repositories/purchase-request.repository';
import PurchaseOrderRepository from '../../../../Procurement/data/repositories/purchase.order.repository';
import type PurchaseOrderModel from '../../../../Procurement/core/models/purchase.order.model';
import MaterialReceiptRepository from '../../../data/repositories/material-receipt.repository';
import MaterialReceiptHistoryRepository from '../../../data/repositories/material-receipt-history.repository';
import PurchaseRequestReceiptItemSummaryModel from '../../../core/models/purchase-request-receipt-item-summary.model';
import PurchaseRequestReceiptModel from '../../../core/models/purchase-request-receipt.model';
import PurchaseRequestReceiptItemParams from '../../../core/params/purchase-request-receipt-item.params';
import StorePurchaseRequestReceiptParams from '../../../core/params/store-purchase-request-receipt.params';
import MaterialReceiptController from '../material-receipt.controller';

const controller = MaterialReceiptController.getInstance();
const request = () => PurchaseRequestModel.fromJson(requestRecord());
const summary = () =>
  PurchaseRequestReceiptItemSummaryModel.fromJson({
    purchase_request_item: requestRecord().items[0],
    requested_quantity: '10.00',
    received_quantity: '6.00',
    remaining_quantity: '4.00',
  });
const params = () =>
  new StorePurchaseRequestReceiptParams({
    purchaseRequestId: 1,
    date: '2026-10-15',
    items: [new PurchaseRequestReceiptItemParams(1, 2)],
  });
beforeEach(() => {
  vi.restoreAllMocks();
  controller.activate(140);
  controller.requestsState.value = new DataSuccess({ data: [request()] });
  vi.spyOn(MaterialReceiptRepository.getInstance(), 'index').mockResolvedValue(
    new DataSuccess({ data: [summary()] }),
  );
  vi.spyOn(PurchaseOrderRepository.getInstance(), 'show').mockResolvedValue(
    new DataSuccess({ data: null }),
  );
});
it('fetches purchase requests by quote and keeps its state separate from summary/history', async () => {
  const index = vi
    .spyOn(PurchaseRequestRepository.getInstance(), 'index')
    .mockResolvedValue(new DataSuccess({ data: [request()] }));
  await controller.loadRequests();
  expect(index.mock.calls[0]?.[0]?.toMap()).toEqual({ quote_id: 140 });
  expect(controller.requestsState.value.data?.[0]?.id).toBe(1);
  expect(controller.listState.value).toBeInstanceOf(DataInitial);
  expect(controller.historyState.value).toBeInstanceOf(DataInitial);
});
it('ignores a late summary after switching purchase requests', async () => {
  let resolve!: (value: DataSuccess<PurchaseRequestReceiptItemSummaryModel[]>) => void;
  vi.spyOn(MaterialReceiptRepository.getInstance(), 'index').mockImplementation(
    () =>
      new Promise((done) => {
        resolve = done;
      }),
  );
  controller.selectRequest(1);
  controller.selectRequest(null);
  resolve(new DataSuccess({ data: [summary()] }));
  await vi.waitFor(() => expect(controller.listState.value).toBeInstanceOf(DataInitial));
  expect(controller.listState.value.data).toBeNull();
});
it('keeps the second request summary when the first request responds late', async () => {
  const second = PurchaseRequestModel.fromJson({
    ...requestRecord(),
    id: 2,
    items: [{ ...requestRecord().items[0], id: 2 }],
  });
  controller.requestsState.value = new DataSuccess({ data: [request(), second] });
  let resolveFirst!: (value: DataSuccess<PurchaseRequestReceiptItemSummaryModel[]>) => void;
  const secondSummary = PurchaseRequestReceiptItemSummaryModel.fromJson({
    purchase_request_item: { ...requestRecord().items[0], id: 2 },
    requested_quantity: '10.00',
    received_quantity: '0.00',
    remaining_quantity: '10.00',
  });
  vi.spyOn(MaterialReceiptRepository.getInstance(), 'index')
    .mockImplementationOnce(
      () =>
        new Promise((done) => {
          resolveFirst = done;
        }),
    )
    .mockResolvedValueOnce(new DataSuccess({ data: [secondSummary] }));
  controller.selectRequest(1);
  controller.selectRequest(2);
  await vi.waitFor(() =>
    expect(controller.listState.value.data?.[0]?.purchaseRequestItem.id).toBe(2),
  );
  resolveFirst(new DataSuccess({ data: [summary()] }));
  await vi.waitFor(() =>
    expect(controller.listState.value.data?.[0]?.purchaseRequestItem.id).toBe(2),
  );
});
it('isolates quote-wide history and filters locally by selected request', async () => {
  const first = PurchaseRequestReceiptModel.fromJson({
    id: 3,
    purchase_request_id: 1,
    quote_id: 140,
    project_id: 86,
    employee: { id: 7, name: 'Receiver', type: 2 },
    organization_employee: { id: 1, name: 'Recorder', type: 1 },
    status: 1,
    date: '2026-10-15',
    items: [],
    created_at: '2026-10-15 08:00:00',
  });
  const second = PurchaseRequestReceiptModel.fromJson({
    id: 4,
    purchase_request_id: 2,
    quote_id: 140,
    project_id: 86,
    employee: { id: 7, name: 'Receiver', type: 2 },
    organization_employee: { id: 1, name: 'Recorder', type: 1 },
    status: 2,
    date: '2026-10-15',
    items: [],
    created_at: '2026-10-15 08:01:00',
  });
  const show = vi
    .spyOn(MaterialReceiptHistoryRepository.getInstance(), 'show')
    .mockResolvedValue(new DataSuccess({ data: [first, second] }));
  await controller.loadHistory();
  expect(show.mock.calls[0]?.[0]?.toMap()).toEqual({ quote_id: 140 });
  controller.selectRequest(1);
  expect(controller.visibleHistory.value.map((entry) => entry.id)).toEqual([3]);
  expect(show).toHaveBeenCalledTimes(1);
});
it('rejects late quote history after owner change', async () => {
  let resolve!: (value: DataSuccess<PurchaseRequestReceiptModel[]>) => void;
  vi.spyOn(MaterialReceiptHistoryRepository.getInstance(), 'show').mockImplementation(
    () =>
      new Promise((done) => {
        resolve = done;
      }),
  );
  const pending = controller.loadHistory();
  controller.activate(141);
  resolve(new DataSuccess({ data: [] }));
  expect(await pending).toBeInstanceOf(DataCancelled);
  expect(controller.historyState.value).toBeInstanceOf(DataInitial);
});
it('blocks duplicate Store and preserves Store success if refresh fails', async () => {
  controller.purchaseRequestId.value = 1;
  controller.listState.value = new DataSuccess({ data: [summary()] });
  controller.orderState.value = new DataSuccess({ data: { status: 3 } as PurchaseOrderModel });
  let resolve!: (value: DataSuccess<void>) => void;
  const create = vi.spyOn(MaterialReceiptRepository.getInstance(), 'create').mockImplementation(
    () =>
      new Promise((done) => {
        resolve = done;
      }),
  );
  vi.spyOn(MaterialReceiptRepository.getInstance(), 'index').mockResolvedValue(
    new DataFailed({ error: new ErrorModel('summary failed', ErrorType.serviceSide) }),
  );
  vi.spyOn(MaterialReceiptHistoryRepository.getInstance(), 'show').mockResolvedValue(
    new DataSuccess({ data: [] }),
  );
  const pending = controller.create(params());
  await vi.waitFor(() => expect(create).toHaveBeenCalledTimes(1));
  expect(await controller.create(params())).toBeInstanceOf(DataCancelled);
  resolve(new DataSuccess<void>({ message: 'Saved' }));
  expect(await pending).toBeInstanceOf(DataSuccess);
  expect(controller.mutationState.value).toBeInstanceOf(DataSuccess);
  expect(controller.refreshFailed.value).toBe(true);
  expect(await controller.create(params())).toBeInstanceOf(DataCancelled);
});
