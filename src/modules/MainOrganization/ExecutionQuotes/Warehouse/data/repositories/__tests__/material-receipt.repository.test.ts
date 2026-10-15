import { beforeEach, expect, it } from 'vitest';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { mockNetwork, response } from '../../../../SiteTeam/__tests__/network';
import { requestRecord } from '../../../../Procurement/__tests__/fixtures';
import MaterialReceiptRepository from '../material-receipt.repository';
import MaterialReceiptHistoryRepository from '../material-receipt-history.repository';
import FetchPurchaseRequestReceiptsParams from '../../../core/params/fetch-purchase-request-receipts.params';
import FetchPurchaseRequestReceiptsHistoryParams from '../../../core/params/fetch-purchase-request-receipts-history.params';

let post: ReturnType<typeof mockNetwork>;
beforeEach(() => {
  post = mockNetwork();
});
it('maps a direct summary array and preserves zero remaining', async () => {
  post.mockResolvedValue(
    response({
      status: true,
      data: [
        {
          purchase_request_item: requestRecord().items[0],
          requested_quantity: '10.00',
          received_quantity: '10.00',
          remaining_quantity: '0.00',
        },
      ],
    }),
  );
  const result = await MaterialReceiptRepository.getInstance().index(
    new FetchPurchaseRequestReceiptsParams(1),
  );
  expect(result).toBeInstanceOf(DataSuccess);
  expect(result.data?.[0]?.purchaseRequestItem.id).toBe(1);
  expect(result.data?.[0]?.canReceive).toBe(false);
});
it('maps a direct flat history array without merging repeated purchase request items', async () => {
  const base = {
    purchase_request_id: 1,
    quote_id: 140,
    project_id: 86,
    employee: { id: 7, name: 'Receiver', type: 2 },
    organization_employee: { id: 1, name: 'Recorder', type: 1 },
    date: '2026-10-15',
    created_at: '2026-10-15 08:06:17',
  };
  post.mockResolvedValue(
    response({
      status: true,
      data: [
        {
          ...base,
          id: 3,
          status: 2,
          items: [{ id: 5, purchase_request_item_id: 1, quantity: '1.00' }],
        },
        {
          ...base,
          id: 2,
          status: 1,
          items: [{ id: 4, purchase_request_item_id: 1, quantity: '2.00' }],
        },
      ],
    }),
  );
  const result = await MaterialReceiptHistoryRepository.getInstance().show(
    new FetchPurchaseRequestReceiptsHistoryParams(140),
  );
  expect(result).toBeInstanceOf(DataSuccess);
  expect(result.data?.map((entry) => entry.status)).toEqual([2, 1]);
  expect(result.data?.map((entry) => entry.items[0]?.id)).toEqual([5, 4]);
  expect(result.data?.map((entry) => entry.items[0]?.purchaseRequestItemId)).toEqual([1, 1]);
});
it('treats empty direct arrays as successful empty lists', async () => {
  post.mockResolvedValue(response({ status: true, data: [] }));
  const summary = await MaterialReceiptRepository.getInstance().index(
    new FetchPurchaseRequestReceiptsParams(1),
  );
  const history = await MaterialReceiptHistoryRepository.getInstance().show(
    new FetchPurchaseRequestReceiptsHistoryParams(140),
  );
  expect(summary).toBeInstanceOf(DataSuccess);
  expect(history).toBeInstanceOf(DataSuccess);
  expect(summary.data).toEqual([]);
  expect(history.data).toEqual([]);
});
