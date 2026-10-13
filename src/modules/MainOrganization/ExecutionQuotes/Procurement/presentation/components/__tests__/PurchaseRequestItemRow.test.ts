import { afterEach, expect, it, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import PrimeVue from 'primevue/config';
import RadioButton from 'primevue/radiobutton';
import TitleInterface from '@/base/Data/Models/titleInterface';
import PurchaseRequestItemRow from '../PurchaseRequestItemRow.vue';
import PurchaseRequestController from '../../controllers/purchase-request.controller';
import { mockNetwork, response } from '../../../../SiteTeam/__tests__/network';
import en from '@/locales/en.json';
import ar from '@/locales/ar.json';
afterEach(() => {
  PurchaseRequestController.getInstance().release();
  vi.unstubAllGlobals();
});
it('clears a Material association before switching to the Product catalog', async () => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  );
  const post = mockNetwork();
  post.mockResolvedValue(response({ status: true, data: [] }));
  PurchaseRequestController.getInstance().activate(140);
  const wrapper = mount(PurchaseRequestItemRow, {
    props: {
      modelValue: {
        key: 0,
        stage: new TitleInterface({ id: 17, title: 'Stage' }),
        itemableType: 'material',
        itemable: new TitleInterface({ id: 5, title: 'Material' }),
        quantity: 2.5,
      },
      index: 0,
      canRemove: false,
      disabled: false,
      errors: [],
    },
    global: {
      plugins: [PrimeVue, createI18n({ legacy: false, locale: 'en', messages: { en, ar } })],
    },
  });
  wrapper
    .findAllComponents(RadioButton)
    .find((input) => input.props('value') === 'product')
    ?.vm.$emit('update:modelValue', 'product');
  await flushPromises();
  const emitted = wrapper.emitted('update:modelValue')?.[0]?.[0];
  expect(emitted).toMatchObject({
    itemableType: 'product',
    itemable: null,
    quantity: 2.5,
    stage: { id: 17 },
  });
  await wrapper.setProps({
    modelValue: { ...wrapper.props('modelValue'), itemableType: 'product', itemable: null },
  });
  await flushPromises();
  expect(post.mock.calls.some((call) => call[0].url.includes('fetch_products'))).toBe(true);
  expect(
    post.mock.calls.filter((call) => call[0].url.includes('fetch_products'))[0]?.[0].data,
  ).toMatchObject({ with_pagination: 1, page: 1 });
  wrapper.unmount();
});
