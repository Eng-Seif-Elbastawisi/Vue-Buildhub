import { beforeEach, expect, it } from 'vitest';
import { mockNetwork, response } from '../../../../SiteTeam/__tests__/network';
import PurchaseRequestApiService from '../purchase-request.api-service';
import FetchPurchaseRequestsParams from '../../../core/params/fetch.purchase-requests.params';
import { storeParams } from '../../../__tests__/fixtures';
let post: ReturnType<typeof mockNetwork>;
beforeEach(() => {
  post = mockNetwork();
});
it.each(['fetch', 'store'])(
  'uses authenticated POST JSON transport for %s without retry',
  async (operation) => {
    const params = operation === 'fetch' ? new FetchPurchaseRequestsParams(140) : storeParams();
    const service = PurchaseRequestApiService.getInstance();
    post.mockResolvedValue(
      response(operation === 'fetch' ? { status: true, data: [] } : { status: true }),
    );
    await (operation === 'fetch' ? service.index(params) : service.create(params));
    expect(post.mock.calls[0]?.[0]).toMatchObject({
      url: expect.stringContaining(
        operation === 'fetch' ? 'fetch_purchase_requests' : 'store_purchase_request',
      ),
      data: params.toMap(),
      isAuth: true,
    });
    expect(post.mock.calls[0]?.[1]?.enableRetry).toBe(false);
    expect(post).toHaveBeenCalledTimes(1);
  },
);
it('rejects invalid items before transport', async () => {
  await expect(
    PurchaseRequestApiService.getInstance().create(storeParams({ items: [] })),
  ).rejects.toThrow();
  expect(post).not.toHaveBeenCalled();
});
