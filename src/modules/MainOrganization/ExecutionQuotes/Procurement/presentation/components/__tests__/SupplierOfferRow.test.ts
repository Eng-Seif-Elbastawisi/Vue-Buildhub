import { afterEach, expect, it, vi } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import Select from 'primevue/select';
import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
import TitleInterface from '@/base/Data/Models/titleInterface';
import SupplierOfferRow from '../SupplierOfferRow.vue';
import PurchaseRequestPricesController from '../../controllers/purchase-request-prices.controller';
import PurchaseRequestController from '../../controllers/purchase-request.controller';
import { mountDialog } from '../../../../SiteTeam/presentation/components/__tests__/harness';
import { mockNetwork, response } from '../../../../SiteTeam/__tests__/network';
import { activatePurchaseRequests } from '../../../__tests__/price-fixtures';
afterEach(() => {
  PurchaseRequestController.getInstance().release();
  PurchaseRequestPricesController.getInstance().release();
  vi.unstubAllGlobals();
});
it('uses real paginated supplier lookup, restores selection and emits supplier ID, never offer ID', async () => {
  const post = mockNetwork();
  activatePurchaseRequests();
  PurchaseRequestPricesController.getInstance().activate(140, 1);
  post.mockResolvedValue(
    response({
      status: true,
      data: { data: [{ id: 3, name: 'ABC Supplier' }], meta: { current_page: 1, last_page: 2 } },
    }),
  );
  const wrapper = mountDialog(SupplierOfferRow, {
    row: {
      key: 15,
      supplier: new TitleInterface({ id: 3, title: 'ABC Supplier' }),
      price: '1500.00',
      duration: '2',
      durationType: new TitleInterface({ id: 2, title: '' }),
    },
    index: 0,
    disabled: false,
    errors: [],
  });
  await flushPromises();
  expect(wrapper.get('#supplier-offer-15-price').element).toHaveProperty('value', '1500.00');
  expect(wrapper.findAllComponents(UpdatedCustomInputSelect)[0]?.props('modelValue')).toMatchObject(
    { id: 3, title: 'ABC Supplier' },
  );
  wrapper.findAllComponents(Select)[0]?.vm.$emit('filter', { value: 'ABC' });
  await flushPromises();
  expect(post.mock.calls.at(-1)?.[0].data).toMatchObject({
    word: 'ABC',
    page: 1,
    with_pagination: 1,
  });
  const select = wrapper.findAllComponents(UpdatedCustomInputSelect)[0];
  select?.vm.$emit('update:modelValue', new TitleInterface({ id: 4, title: 'New Supplier' }));
  await flushPromises();
  expect(wrapper.emitted('update')?.at(-1)?.[0]).toMatchObject({ supplier: { id: 4 } });
  await wrapper.get('#supplier-offer-15-price').setValue('200.125');
  expect(wrapper.emitted('update')?.at(-1)?.[0]).toEqual({ price: '200.125' });
  wrapper.unmount();
});
it('exposes labeled controls, numeric duration units and adjacent field errors', async () => {
  mockNetwork();
  activatePurchaseRequests();
  PurchaseRequestPricesController.getInstance().activate(140, 1);
  const wrapper = mountDialog(SupplierOfferRow, {
    row: { key: 1, supplier: null, price: '', duration: '', durationType: null },
    index: 0,
    disabled: false,
    errors: [{ field: 'suppliers.0.price', message: 'Price is required' }],
  });
  await flushPromises();
  expect(wrapper.get('#supplier-offer-1-price').attributes('aria-invalid')).toBe('true');
  expect(wrapper.get('#supplier-offer-1-price-error').text()).toBe('Price is required');
  const unit = wrapper
    .findAllComponents(UpdatedCustomInputSelect)
    .find((input) => input.props('id') === 'supplier-offer-1-unit');
  expect(unit?.props('staticOptions').map((option: TitleInterface) => option.id)).toEqual([
    1, 2, 3, 4,
  ]);
  expect(wrapper.get('label[for="supplier-offer-1-price"]').text()).toBe('Offered Price');
  wrapper.unmount();
});
