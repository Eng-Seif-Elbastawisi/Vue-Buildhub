import { afterEach, expect, it } from 'vitest';
import { mount, flushPromises, enableAutoUnmount } from '@vue/test-utils';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import Panel from '../SupplierPriceOffersPanel.vue';
import Requests from '../../controllers/purchase-request.controller';
import Prices from '../../controllers/purchase-request-prices.controller';
import Orders from '../../controllers/purchase.order.controller';
import RequestModel from '../../../core/models/purchase-request.model';
import { requestRecord } from '../../../__tests__/fixtures';
import { mockNetwork, response } from '../../../../SiteTeam/__tests__/network';
enableAutoUnmount(afterEach);
afterEach(() => {
  Requests.getInstance().release();
  Prices.getInstance().release();
  Orders.getInstance().release();
});
function setup(status: number) {
  const post = mockNetwork();
  const requests = Requests.getInstance();
  requests.activate(140);
  requests.listState.value = new DataSuccess({
    data: [RequestModel.fromJson({ ...requestRecord(), status })],
  });
  post.mockImplementation(async (request) => {
    if (request.url.endsWith('/fetch_purchase_request_prices'))
      return response({
        status: true,
        data: [4, 5].map((id) => ({
          id,
          purchase_request_id: 1,
          supplier: { id: id + 10, title: `Supplier ${id}` },
          price: '1500.00',
          duration: 2,
          duration_type: 2,
        })),
      });
    throw new Error('Supplier Prices must only fetch saved offers');
  });
  const wrapper = mount(Panel, { props: { quoteId: 140, purchaseRequestId: 1 } });
  return { wrapper, post };
}
it('opens Store with the clicked request and offer IDs without fetching an order', async () => {
  const { wrapper, post } = setup(1);
  await flushPromises();
  await wrapper.findAll('tbody tr')[1]?.get('button').trigger('click');
  await flushPromises();
  expect(wrapper.emitted('storeOrder')).toEqual([[1, 5]]);
  expect(post.mock.calls.map((call) => call[0].url.split('/').at(-1))).toEqual([
    'fetch_purchase_request_prices',
  ]);
  expect(wrapper.text()).not.toContain('View Purchase Order');
});
it.each([2, 3])(
  'keeps saved offers read-only for status %s without fetching or viewing orders',
  async (status) => {
    const { wrapper, post } = setup(status);
    await flushPromises();
    expect(wrapper.findAll('tbody button')).toHaveLength(0);
    expect(wrapper.findAll('tbody tr')).toHaveLength(2);
    expect(wrapper.text()).not.toContain('View Purchase Order');
    expect(post.mock.calls.some((call) => call[0].url.endsWith('/fetch_purchase_order'))).toBe(
      false,
    );
  },
);
it('opens Store from the header without requiring an order Fetch', async () => {
  const { wrapper, post } = setup(1);
  await flushPromises();
  const store = wrapper
    .findAll('header button')
    .find((button) => button.text() === 'Issue Purchase Order');
  if (!store) throw new Error('Missing Store dialog entry');
  await store.trigger('click');
  expect(wrapper.emitted('storeOrder')).toEqual([[1]]);
  expect(post).toHaveBeenCalledOnce();
});
it('refreshes Supplier Prices after closing Store without fetching any order', async () => {
  const { wrapper, post } = setup(1);
  await flushPromises();
  await wrapper.vm.refreshAfterOrder();
  expect(post.mock.calls.map((call) => call[0].url.split('/').at(-1))).toEqual([
    'fetch_purchase_request_prices',
    'fetch_purchase_request_prices',
  ]);
});
