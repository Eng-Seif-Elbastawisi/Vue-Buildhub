import { beforeEach, expect, it } from 'vitest';
import { mockNetwork, response } from '../../../../SiteTeam/__tests__/network';
import MaterialDisbursementApiService from '../material-disbursement.api-service';
import FetchDisbursementStockParams from '../../../core/params/fetch-disbursement-stock.params';
import FetchDisbursementsParams from '../../../core/params/fetch-disbursements.params';
import StorePurchaseRequestDisbursementParams from '../../../core/params/store-purchase-request-disbursement.params';
import PurchaseRequestDisbursementItemParams from '../../../core/params/purchase-request-disbursement-item.params';

let post: ReturnType<typeof mockNetwork>;
beforeEach(() => {
  post = mockNetwork();
});

it.each([
  [
    'stock',
    'fetch_purchase_request_disbursement_stock',
    new FetchDisbursementStockParams(140),
    { quote_id: 140 },
  ],
  [
    'history',
    'fetch_purchase_request_disbursements',
    new FetchDisbursementsParams(140),
    { quote_id: 140 },
  ],
  [
    'store',
    'store_purchase_request_disbursement',
    new StorePurchaseRequestDisbursementParams({
      quoteId: 140,
      receiverId: 7,
      date: '2026-10-15',
      items: [new PurchaseRequestDisbursementItemParams(9, 1)],
    }),
    {
      quote_id: 140,
      receiver_id: 7,
      date: '2026-10-15',
      items: [{ purchase_request_item_id: 9, quantity: 1 }],
    },
  ],
] as const)(
  '%s uses authenticated JSON POST and the correct quote scope',
  async (operation, endpoint, params, payload) => {
    post.mockResolvedValue(
      response({ status: true, data: operation === 'store' ? undefined : [] }),
    );
    const service = MaterialDisbursementApiService.getInstance();
    await (operation === 'stock'
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

it('rejects wrapped stock/history data and unconfirmed Store success', async () => {
  post.mockResolvedValueOnce(response({ status: true, data: { stock: [] } }));
  await expect(
    MaterialDisbursementApiService.getInstance().index(new FetchDisbursementStockParams(140)),
  ).rejects.toThrow();
  post.mockResolvedValueOnce(response({ status: true, data: { disbursements: [] } }));
  await expect(
    MaterialDisbursementApiService.getInstance().show(new FetchDisbursementsParams(140)),
  ).rejects.toThrow();
  post.mockResolvedValueOnce(response({ message: 'Saved' }));
  await expect(
    MaterialDisbursementApiService.getInstance().create(
      new StorePurchaseRequestDisbursementParams({
        quoteId: 140,
        receiverId: 7,
        date: '2026-10-15',
        items: [new PurchaseRequestDisbursementItemParams(9, 1)],
      }),
    ),
  ).rejects.toThrow('material_disbursement.unconfirmed_store');
});
