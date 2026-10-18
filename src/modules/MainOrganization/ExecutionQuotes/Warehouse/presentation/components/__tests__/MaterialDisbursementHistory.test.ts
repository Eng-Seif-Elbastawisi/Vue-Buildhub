import { expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import PurchaseRequestDisbursementModel from '../../../core/models/purchase-request-disbursement.model';
import { disbursementRecord } from '../../../__tests__/disbursement-fixtures';
import MaterialDisbursementHistory from '../MaterialDisbursementHistory.vue';

it('shows quote-wide history and emits a detail request without changing the record', async () => {
  const record = PurchaseRequestDisbursementModel.fromJson(disbursementRecord());
  const wrapper = mount(MaterialDisbursementHistory, {
    props: { state: new DataSuccess({ data: [record] }), retry: vi.fn() },
  });
  expect(wrapper.text()).toContain('Receiver');
  expect(wrapper.text()).toContain('Issuer');
  expect(wrapper.text()).toContain('Material Disbursement');
  await wrapper.get('tbody button').trigger('click');
  expect(wrapper.emitted('details')?.[0]).toEqual([1]);
  expect(record.items).toHaveLength(2);
  wrapper.unmount();
});

it('shows a useful empty history state', () => {
  const wrapper = mount(MaterialDisbursementHistory, {
    props: { state: new DataSuccess({ data: [] }), retry: vi.fn() },
  });
  expect(wrapper.text()).toContain('No disbursements yet');
  expect(wrapper.find('table').exists()).toBe(false);
  wrapper.unmount();
});
