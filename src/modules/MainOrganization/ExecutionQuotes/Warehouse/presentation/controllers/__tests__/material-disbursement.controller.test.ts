import { beforeEach, expect, it, vi } from 'vitest';
import {
  DataCancelled,
  DataFailed,
  DataInitial,
  DataSuccess,
  DataTimeout,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { ErrorModel, ErrorType } from '@/base/Core/NetworkStructure/Resources/errors/errorModel';
import { stockRecord, disbursementRecord } from '../../../__tests__/disbursement-fixtures';
import DisbursementStockModel from '../../../core/models/disbursement-stock.model';
import PurchaseRequestDisbursementModel from '../../../core/models/purchase-request-disbursement.model';
import PurchaseRequestDisbursementItemParams from '../../../core/params/purchase-request-disbursement-item.params';
import StorePurchaseRequestDisbursementParams from '../../../core/params/store-purchase-request-disbursement.params';
import MaterialDisbursementRepository from '../../../data/repositories/material-disbursement.repository';
import MaterialDisbursementHistoryRepository from '../../../data/repositories/material-disbursement-history.repository';
import MaterialDisbursementController from '../material-disbursement.controller';

const controller = MaterialDisbursementController.getInstance();
const stock = () => DisbursementStockModel.fromJson(stockRecord());
const history = () => PurchaseRequestDisbursementModel.fromJson(disbursementRecord());
const params = (quantity = 2) =>
  new StorePurchaseRequestDisbursementParams({
    quoteId: 140,
    receiverId: 7,
    date: '2026-10-15',
    items: [new PurchaseRequestDisbursementItemParams(9, quantity)],
  });

beforeEach(() => {
  vi.restoreAllMocks();
  controller.activate(140);
  vi.spyOn(MaterialDisbursementRepository.getInstance(), 'index').mockResolvedValue(
    new DataSuccess({ data: [stock()] }),
  );
  vi.spyOn(MaterialDisbursementHistoryRepository.getInstance(), 'show').mockResolvedValue(
    new DataSuccess({ data: [history()] }),
  );
});

it('loads quote-scoped stock and history independently', async () => {
  const index = vi.mocked(MaterialDisbursementRepository.getInstance().index);
  const show = vi.mocked(MaterialDisbursementHistoryRepository.getInstance().show);
  await controller.load();
  expect(index.mock.calls[0]?.[0]?.toMap()).toEqual({ quote_id: 140 });
  expect(show.mock.calls[0]?.[0]?.toMap()).toEqual({ quote_id: 140 });
  expect(controller.listState.value.data?.[0]?.availableQuantity).toBe('4.00');
  expect(controller.historyState.value.data?.[0]?.receiver.id).toBe(7);
});

it('rejects late stock and history from the previous quote', async () => {
  let resolveStock!: (state: DataSuccess<DisbursementStockModel[]>) => void;
  let resolveHistory!: (state: DataSuccess<PurchaseRequestDisbursementModel[]>) => void;
  vi.spyOn(MaterialDisbursementRepository.getInstance(), 'index').mockImplementation(
    () =>
      new Promise((done) => {
        resolveStock = done;
      }),
  );
  vi.spyOn(MaterialDisbursementHistoryRepository.getInstance(), 'show').mockImplementation(
    () =>
      new Promise((done) => {
        resolveHistory = done;
      }),
  );
  const stockPending = controller.loadStock();
  const historyPending = controller.loadHistory();
  controller.activate(141);
  resolveStock(new DataSuccess({ data: [stock()] }));
  resolveHistory(new DataSuccess({ data: [history()] }));
  expect(await stockPending).toBeInstanceOf(DataCancelled);
  expect(await historyPending).toBeInstanceOf(DataCancelled);
  expect(controller.listState.value).toBeInstanceOf(DataInitial);
  expect(controller.historyState.value).toBeInstanceOf(DataInitial);
});

it('does not issue an item outside current stock or above its available balance', async () => {
  const create = vi.spyOn(MaterialDisbursementRepository.getInstance(), 'create');
  await controller.loadStock();
  expect(await controller.create(params(4.01))).toBeInstanceOf(DataFailed);
  const outside = new StorePurchaseRequestDisbursementParams({
    quoteId: 140,
    receiverId: 7,
    date: '2026-10-15',
    items: [new PurchaseRequestDisbursementItemParams(99, 1)],
  });
  expect(await controller.create(outside)).toBeInstanceOf(DataFailed);
  expect(create).not.toHaveBeenCalled();
});

it('blocks duplicate Store and distinguishes successful issue from failed read refresh', async () => {
  controller.listState.value = new DataSuccess({ data: [stock()] });
  let resolve!: (state: DataSuccess<void>) => void;
  const create = vi
    .spyOn(MaterialDisbursementRepository.getInstance(), 'create')
    .mockImplementation(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
  vi.spyOn(MaterialDisbursementRepository.getInstance(), 'index').mockResolvedValue(
    new DataFailed({ error: new ErrorModel('stock failed', ErrorType.serviceSide) }),
  );
  const pending = controller.create(params());
  await vi.waitFor(() => expect(create).toHaveBeenCalledTimes(1));
  expect(await controller.create(params())).toBeInstanceOf(DataCancelled);
  resolve(new DataSuccess<void>({ message: 'Issued' }));
  expect(await pending).toBeInstanceOf(DataSuccess);
  expect(controller.mutationState.value).toBeInstanceOf(DataSuccess);
  expect(controller.refreshFailed.value).toBe(true);
  expect(await controller.create(params())).toBeInstanceOf(DataCancelled);
});

it('refreshes stock after a rejected Store while retaining the backend error', async () => {
  controller.listState.value = new DataSuccess({ data: [stock()] });
  vi.spyOn(MaterialDisbursementRepository.getInstance(), 'create').mockResolvedValue(
    new DataFailed({ error: new ErrorModel('Insufficient quantity', ErrorType.validation) }),
  );
  const index = vi.mocked(MaterialDisbursementRepository.getInstance().index);
  const result = await controller.create(params());
  expect(result).toBeInstanceOf(DataFailed);
  expect(controller.mutationState.value.error?.title).toBe('Insufficient quantity');
  expect(index).toHaveBeenCalledTimes(1);
});

it('marks a timed-out Store uncertain and never automatically retries the mutation', async () => {
  controller.listState.value = new DataSuccess({ data: [stock()] });
  const create = vi.spyOn(MaterialDisbursementRepository.getInstance(), 'create').mockResolvedValue(
    new DataTimeout<void>(),
  );
  expect(await controller.create(params())).toBeInstanceOf(DataTimeout);
  expect(controller.submissionUncertain.value).toBe(true);
  expect(await controller.create(params())).toBeInstanceOf(DataCancelled);
  await controller.retryRefresh();
  expect(create).toHaveBeenCalledTimes(1);
  expect(controller.submissionUncertain.value).toBe(true);
});

it('rejects history from another quote without replacing the stock state', async () => {
  controller.listState.value = new DataSuccess({ data: [stock()] });
  vi.spyOn(MaterialDisbursementHistoryRepository.getInstance(), 'show').mockResolvedValue(
    new DataSuccess({ data: [PurchaseRequestDisbursementModel.fromJson({ ...disbursementRecord(), quote_id: 141 })] }),
  );
  expect(await controller.loadHistory()).toBeInstanceOf(DataFailed);
  expect(controller.listState.value.data?.[0]?.availableQuantity).toBe('4.00');
});
