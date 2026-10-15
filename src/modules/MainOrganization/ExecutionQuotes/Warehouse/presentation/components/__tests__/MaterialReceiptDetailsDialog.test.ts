import { expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import PrimeVue from 'primevue/config';
import PurchaseRequestReceiptModel from '../../../core/models/purchase-request-receipt.model';
import { requestRecord } from '../../../../Procurement/__tests__/fixtures';
import MaterialReceiptDetailsDialog from '../MaterialReceiptDetailsDialog.vue';

it('shows resolved item names and quantities read-only when no receiving employee was recorded', () => {
  const receipt = PurchaseRequestReceiptModel.fromJson({
    id: 3,
    purchase_request_id: 1,
    quote_id: 140,
    project_id: 86,
    employee: null,
    organization_employee: { id: 1, name: 'Recorder', type: 1 },
    status: 2,
    date: '2026-10-15',
    items: [{ id: 5, purchase_request_item: requestRecord().items[0], quantity: '4.00' }],
    created_at: '2026-10-15 08:06:17',
  });
  const wrapper = mount(MaterialReceiptDetailsDialog, {
    props: { visible: true, receipt },
    global: { plugins: [PrimeVue] },
  });
  expect(wrapper.get('.material-receipt__detail-items').text()).toContain('Material Title');
  expect(wrapper.get('.material-receipt__detail-items').text()).toContain('4.00');
  expect(wrapper.text()).toContain('Recorder');
  expect(wrapper.text()).toContain('Fully Received');
  expect(wrapper.find('input').exists()).toBe(false);
  wrapper.unmount();
});
