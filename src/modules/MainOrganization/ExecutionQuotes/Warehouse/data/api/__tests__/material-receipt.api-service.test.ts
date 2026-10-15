import { beforeEach, expect, it } from 'vitest';
import { mockNetwork, response } from '../../../../SiteTeam/__tests__/network';
import MaterialReceiptApiService from '../material-receipt.api-service';
import FetchPurchaseRequestReceiptsParams from '../../../core/params/fetch-purchase-request-receipts.params';
import FetchPurchaseRequestReceiptsHistoryParams from '../../../core/params/fetch-purchase-request-receipts-history.params';
import StorePurchaseRequestReceiptParams from '../../../core/params/store-purchase-request-receipt.params';
import PurchaseRequestReceiptItemParams from '../../../core/params/purchase-request-receipt-item.params';

let post: ReturnType<typeof mockNetwork>;
beforeEach(() => {
  post = mockNetwork();
});
it.each([
  [
    'summary',
    'fetch_purchase_request_receipts',
    new FetchPurchaseRequestReceiptsParams(5),
    { purchase_request_id: 5 },
  ],
  [
    'history',
    'fetch_purchase_request_receipts_history',
    new FetchPurchaseRequestReceiptsHistoryParams(140),
    { quote_id: 140 },
  ],
  [
    'store',
    'store_purchase_request_receipt',
    new StorePurchaseRequestReceiptParams({
      purchaseRequestId: 5,
      date: '2026-10-15',
      items: [new PurchaseRequestReceiptItemParams(9, 1)],
    }),
    {
      purchase_request_id: 5,
      date: '2026-10-15',
      items: [{ purchase_request_item_id: 9, quantity: 1 }],
    },
  ],
] as const)(
  '%s uses authenticated JSON POST with the correct owner and no retry',
  async (operation, endpoint, params, payload) => {
    post.mockResolvedValue(
      response({ status: true, data: operation === 'store' ? undefined : [] }),
    );
    const service = MaterialReceiptApiService.getInstance();
    await (operation === 'summary'
      ? service.index(params)
      : operation === 'history'
        ? service.show(params)
        : service.create(params));
    expect(post.mock.calls[0]?.[0]).toMatchObject({
      url: expect.stringContaining(endpoint),
      data: payload,
      isAuth: true,
    });
    expect(post.mock.calls[0]?.[1]?.enableRetry).toBe(false);
    expect(post).toHaveBeenCalledTimes(1);
  },
);
it('rejects a legacy wrapped list response', async () => {
  post.mockResolvedValue(response({ status: true, data: { items_summary: [] } }));
  await expect(
    MaterialReceiptApiService.getInstance().index(new FetchPurchaseRequestReceiptsParams(5)),
  ).rejects.toThrow();
});
it('does not confirm Store from HTTP success without the established boolean status', async () => {
  post.mockResolvedValue(response({ message: 'Saved' }));
  const params = new StorePurchaseRequestReceiptParams({
    purchaseRequestId: 5,
    date: '2026-10-15',
    items: [new PurchaseRequestReceiptItemParams(9, 1)],
  });
  await expect(MaterialReceiptApiService.getInstance().create(params)).rejects.toThrow(
    'material_receipt.unconfirmed_store',
  );
  expect(post).toHaveBeenCalledTimes(1);
});
