import { afterEach, expect, it } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import PrimeVue from 'primevue/config';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import PurchaseOrderViewDialog from '../PurchaseOrderViewDialog.vue';
import PurchaseOrderController from '../../controllers/purchase.order.controller';
import PurchaseRequestController from '../../controllers/purchase-request.controller';
import PurchaseRequestModel from '../../../core/models/purchase-request.model';
import { requestRecord } from '../../../__tests__/fixtures';
import { orderRecord } from '../../../__tests__/order-fixtures';
import { mockNetwork, response } from '../../../../SiteTeam/__tests__/network';

afterEach(() => {
  PurchaseOrderController.getInstance().release();
  PurchaseRequestController.getInstance().release();
});

it('fetches and displays an existing order without a creation form', async () => {
  const post = mockNetwork();
  post.mockResolvedValue(response({ status: true, data: orderRecord() }));
  const requests = PurchaseRequestController.getInstance();
  requests.activate(140);
  requests.listState.value = new DataSuccess({
    data: [PurchaseRequestModel.fromJson({ ...requestRecord(), status: 3 })],
  });
  const wrapper = mount(PurchaseOrderViewDialog, {
    props: { quoteId: 140, purchaseRequestId: 1 },
    global: { plugins: [PrimeVue], stubs: { Dialog: { template: '<section><slot /></section>' } } },
  });
  await flushPromises();
  expect(post.mock.calls[0]?.[0].data).toEqual({ purchase_request_id: 1 });
  expect(wrapper.text()).toContain('Techlab Employee');
  expect(wrapper.find('form').exists()).toBe(false);
  await wrapper
    .findAll('button')
    .find((button) => button.text() === 'Close')
    ?.trigger('click');
  expect(wrapper.emitted('close')).toHaveLength(1);
  wrapper.unmount();
});
