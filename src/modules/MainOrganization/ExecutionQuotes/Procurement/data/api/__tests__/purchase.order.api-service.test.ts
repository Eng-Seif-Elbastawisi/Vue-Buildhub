import { beforeEach, expect, it } from 'vitest';
import { mockNetwork, response } from '../../../../SiteTeam/__tests__/network';
import Service from '../purchase.order.api-service';
import FetchParams from '../../../core/params/fetch.purchase.order.params';
import StoreParams from '../../../core/params/store.purchase.order.params';
let post: ReturnType<typeof mockNetwork>;
beforeEach(() => {
  post = mockNetwork();
});
it.each(['fetch', 'store'])(
  'uses existing authenticated JSON POST %s without retries',
  async (operation) => {
    post.mockResolvedValue(response({ status: true, data: null }));
    const params =
      operation === 'fetch' ? new FetchParams(2) : new StoreParams(2, 4, null, null, '2026-10-14');
    await (operation === 'fetch'
      ? Service.getInstance().show(params)
      : Service.getInstance().create(params));
    expect(post.mock.calls[0]?.[0]).toMatchObject({
      url: expect.stringContaining(`${operation}_purchase_order`),
      data: params.toMap(),
      isAuth: true,
    });
    expect(post.mock.calls[0]?.[1]?.enableRetry).toBe(false);
    expect(post).toHaveBeenCalledOnce();
  },
);
it('requires explicit mutation success and rejects array Fetch data', async () => {
  post.mockResolvedValue(response({ message: 'OK' }));
  await expect(
    Service.getInstance().create(new StoreParams(2, 4, null, null, '2026-10-14')),
  ).rejects.toThrow('procurement.orders.unconfirmed_store');
  post.mockResolvedValue(response({ status: true, data: [] }));
  await expect(Service.getInstance().show(new FetchParams(2))).rejects.toThrow();
});
