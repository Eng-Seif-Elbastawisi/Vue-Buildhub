import { expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import PrimeVue from 'primevue/config';
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
