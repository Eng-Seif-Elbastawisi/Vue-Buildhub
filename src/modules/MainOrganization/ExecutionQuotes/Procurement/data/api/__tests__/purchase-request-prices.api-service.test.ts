import { beforeEach, expect, it } from 'vitest';
import { mockNetwork, response } from '../../../../SiteTeam/__tests__/network';
import PurchaseRequestPricesApiService from '../purchase-request-prices.api-service';
import FetchPurchaseRequestPricesParams from '../../../core/params/fetch.purchase-request-prices.params';
import StorePurchaseRequestPricesParams from '../../../core/params/store.purchase-request-prices.params';
let post: ReturnType<typeof mockNetwork>;
beforeEach(() => {
  post = mockNetwork();
});
it.each(['fetch', 'store'])(
  'uses authenticated POST JSON %s transport without replay',
  async (operation) => {
    const service = PurchaseRequestPricesApiService.getInstance();
    const params =
      operation === 'fetch'
        ? new FetchPurchaseRequestPricesParams(1)
        : new StorePurchaseRequestPricesParams(1, []);
    post.mockResolvedValue(
      response(operation === 'fetch' ? { status: true, data: [] } : { status: true }),
    );
    await (operation === 'fetch' ? service.index(params) : service.create(params));
    expect(post.mock.calls[0]?.[0]).toMatchObject({
      url: expect.stringContaining(
        `${operation === 'fetch' ? 'fetch' : 'store'}_purchase_request_prices`,
      ),
      data: params.toMap(),
      isAuth: true,
    });
    expect(post.mock.calls[0]?.[1]?.enableRetry).toBe(false);
    expect(post).toHaveBeenCalledOnce();
  },
);
it('rejects invalid request IDs before transport', async () => {
  await expect(
    PurchaseRequestPricesApiService.getInstance().index(new FetchPurchaseRequestPricesParams(0)),
  ).rejects.toThrow();
  expect(post).not.toHaveBeenCalled();
});
