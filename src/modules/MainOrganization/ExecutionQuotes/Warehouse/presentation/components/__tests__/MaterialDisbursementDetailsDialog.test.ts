import { expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import PrimeVue from 'primevue/config';
import ar from '@/locales/ar.json';
import en from '@/locales/en.json';
import PurchaseRequestDisbursementModel from '../../../core/models/purchase-request-disbursement.model';
import { disbursementRecord } from '../../../__tests__/disbursement-fixtures';
import MaterialDisbursementDetailsDialog from '../MaterialDisbursementDetailsDialog.vue';

it('shows both employee roles and preserves repeated original item IDs in read-only details', () => {
  const disbursement = PurchaseRequestDisbursementModel.fromJson(disbursementRecord());
  const wrapper = mount(MaterialDisbursementDetailsDialog, {
    props: { visible: true, disbursement },
    global: { plugins: [PrimeVue] },
  });
  expect(wrapper.text()).toContain('Receiver');
  expect(wrapper.text()).toContain('Issuer');
  expect(wrapper.findAll('.material-receipt__detail-items li')).toHaveLength(2);
  expect(wrapper.text()).toContain('1.50');
  expect(wrapper.text()).toContain('2.00');
  expect(wrapper.find('input').exists()).toBe(false);
  wrapper.unmount();
});

it.each([
  ['en', en, 'Item #1'],
  ['ar', ar, 'صنف رقم 1'],
] as const)('shows a localized item number for a null title in %s', (_locale, messages, label) => {
  const record = disbursementRecord();
  const disbursement = PurchaseRequestDisbursementModel.fromJson({
    ...record,
    items: [{ id: 4, purchase_request_item: { id: 1, title: null }, quantity: '2.00' }],
  });
  const wrapper = mount(MaterialDisbursementDetailsDialog, {
    props: { visible: true, disbursement },
    global: {
      plugins: [PrimeVue],
      mocks: {
        $t: (key: string, params?: { id: number }) =>
          messages[key as keyof typeof messages]?.replace('{id}', String(params?.id ?? '')) ?? key,
      },
    },
  });
  expect(wrapper.text()).toContain(label);
  wrapper.unmount();
});
