import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { flushPromises, type VueWrapper } from '@vue/test-utils';
import Select from 'primevue/select';
import TitleInterface from '@/base/Data/Models/titleInterface';
import SupplierPriceOffersDialog from '../SupplierPriceOffersDialog.vue';
import PurchaseRequestPricesController from '../../controllers/purchase-request-prices.controller';
import PurchaseRequestController from '../../controllers/purchase-request.controller';
import { mountDialog } from '../../../../SiteTeam/presentation/components/__tests__/harness';
import { mockNetwork, response } from '../../../../SiteTeam/__tests__/network';
import { activatePurchaseRequests, priceRecord } from '../../../__tests__/price-fixtures';
let post: ReturnType<typeof mockNetwork>;
const controller = PurchaseRequestPricesController.getInstance();
beforeEach(async () => {
  post = mockNetwork();
  activatePurchaseRequests();
  post.mockImplementation(async (request) =>
    response(
      request.url.includes('fetch_purchase_request_prices')
        ? { status: true, data: [priceRecord(3, 15), priceRecord(4, 16)] }
        : { status: true, data: { data: [], meta: { last_page: 1 } } },
    ),
  );
  controller.activate(140, 1);
  await controller.fetchList();
});
afterEach(() => {
  controller.release();
  PurchaseRequestController.getInstance().release();
  vi.unstubAllGlobals();
});
function button(wrapper: VueWrapper, text: string) {
  const found = wrapper.findAll('button').find((button) => button.text() === text);
  if (!found) throw new Error(`Missing button: ${text}`);
  return found;
}
function stores() {
  return post.mock.calls.filter((call) => call[0].url.includes('store_purchase_request_prices'));
}
it('clear-all requires explicit confirmation and includes omitted suppliers by name', async () => {
  const wrapper = mountDialog(SupplierPriceOffersDialog, { purchaseRequestId: 1 });
  await flushPromises();
  for (const remove of wrapper.findAll('button').filter((button) => button.text() === 'Remove'))
    await remove.trigger('click');
  await wrapper.get('form').trigger('submit');
  await flushPromises();
  expect(stores()).toHaveLength(0);
  expect(wrapper.get('[role="alertdialog"]').text()).toContain(
    'Remove all supplier price offers for this purchase request?',
  );
  expect(wrapper.get('[role="alertdialog"]').text()).toContain('Supplier 3');
  post.mockImplementation(async (request) =>
    response(request.url.includes('store_') ? { status: true } : { status: true, data: [] }),
  );
  await button(wrapper, 'Confirm and Save').trigger('click');
  await flushPromises();
  expect(stores()[0]?.[0].data).toEqual({ purchase_request_id: 1, suppliers: [] });
  expect(wrapper.emitted('close')).toHaveLength(1);
  expect(controller.savedOffers.value).toEqual([]);
  wrapper.unmount();
});
it('failed Fetch disables Save and offers a read-only retry', async () => {
  post.mockResolvedValue(response({ status: false, message: 'Read denied' }));
  await controller.fetchList();
  const wrapper = mountDialog(SupplierPriceOffersDialog, { purchaseRequestId: 1 });
  await flushPromises();
  expect(button(wrapper, 'Save All Offers').attributes('disabled')).toBeDefined();
  await wrapper.get('form').trigger('submit');
  expect(stores()).toHaveLength(0);
  post.mockResolvedValue(response({ status: true, data: [] }));
  await button(wrapper, 'Retry Fetch').trigger('click');
  await flushPromises();
  await button(wrapper, 'Add Supplier').trigger('click');
  expect(wrapper.findAll('.procurement-item')).toHaveLength(1);
  wrapper.unmount();
});
it('failed save keeps all prices and shows actual feedback', async () => {
  const wrapper = mountDialog(SupplierPriceOffersDialog, { purchaseRequestId: 1 });
  await flushPromises();
  await wrapper.get('input[inputmode="decimal"]').setValue('123.45');
  post.mockResolvedValue(response({ status: false, message: 'Invalid supplier price' }));
  await wrapper.get('form').trigger('submit');
  await flushPromises();
  expect(wrapper.text()).toContain('Invalid supplier price');
  expect(wrapper.findAll('.procurement-item')).toHaveLength(2);
  expect((wrapper.get('input[inputmode="decimal"]').element as HTMLInputElement).value).toBe(
    '123.45',
  );
  expect(wrapper.emitted('close')).toBeUndefined();
  wrapper.unmount();
});
it('does not silently discard unsaved edits on Cancel', async () => {
  const wrapper = mountDialog(SupplierPriceOffersDialog, { purchaseRequestId: 1 });
  await flushPromises();
  await wrapper.get('input[inputmode="decimal"]').setValue('222.25');
  await button(wrapper, 'Cancel').trigger('click');
  await flushPromises();
  expect(wrapper.get('[role="alertdialog"]').text()).toContain(
    'Discard unsaved supplier offer changes?',
  );
  expect(wrapper.emitted('close')).toBeUndefined();
  await button(wrapper, 'Keep Editing').trigger('click');
  await flushPromises();
  expect(wrapper.find('[role="alertdialog"]').exists()).toBe(false);
  expect((wrapper.get('input[inputmode="decimal"]').element as HTMLInputElement).value).toBe(
    '222.25',
  );
  await button(wrapper, 'Cancel').trigger('click');
  await flushPromises();
  await button(wrapper, 'Discard Changes').trigger('click');
  await flushPromises();
  expect(wrapper.emitted('close')).toHaveLength(1);
  expect(stores()).toHaveLength(0);
  wrapper.unmount();
});

it('rejects duplicate Supplier selection and resets the visible dropdown to its draft selection', async () => {
  const wrapper = mountDialog(SupplierPriceOffersDialog, { purchaseRequestId: 1 });
  await flushPromises();
  await button(wrapper, 'Add Supplier').trigger('click');
  const row = wrapper.findAll('.procurement-item').at(-1);
  if (!row) throw new Error('Missing new supplier row');
  row
    .findAllComponents(Select)[0]
    ?.vm.$emit('update:modelValue', new TitleInterface({ id: 3, title: 'Supplier 3' }));
  await flushPromises();
  expect(wrapper.text()).toContain('Each supplier can appear only once.');
  expect(row.findAllComponents(Select)[0]?.props('modelValue')).toBeNull();
  expect(controller.draft.value.at(-1)?.supplier).toBeNull();
  expect(stores()).toHaveLength(0);
  wrapper.unmount();
});
it('unconfirmed Sync and failed verification never display confirmed persistence feedback', async () => {
  const wrapper = mountDialog(SupplierPriceOffersDialog, { purchaseRequestId: 1 });
  await flushPromises();
  await wrapper.get('input[inputmode="decimal"]').setValue('200.25');
  post.mockResolvedValue(response({ success: true }));
  await wrapper.get('form').trigger('submit');
  await flushPromises();
  expect(button(wrapper, 'Save All Offers').attributes('disabled')).toBeDefined();
  post.mockResolvedValue(response({ status: false, message: 'Verification failed' }));
  await button(wrapper, 'Retry Fetch').trigger('click');
  await flushPromises();
  expect(wrapper.text()).toContain('Persistence could not be confirmed.');
  expect(wrapper.text()).not.toContain('Offers were saved, but refreshing failed.');
  expect(controller.draft.value[0]?.price).toBe('200.25');
  expect(stores()).toHaveLength(1);
  wrapper.unmount();
});
