import { expect, it } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { DataEmpty, DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import {
  DataNoNetwork,
  DataTimeout,
  DataRateLimited,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import MaterialReceiptHistory from '../MaterialReceiptHistory.vue';

it.each([new DataEmpty(), new DataSuccess({ data: [] })])(
  'shows receipt guidance for empty history (%s)',
  (state) => {
    const wrapper = mount(MaterialReceiptHistory, {
      props: { state, retry: async () => undefined },
    });
    expect(wrapper.text()).toContain('No Receipts');
    expect(wrapper.text()).toContain('Saved receipts for this project will appear here.');
    expect(wrapper.find('table').exists()).toBe(false);
    wrapper.unmount();
  },
);

it.each([new DataNoNetwork(), new DataTimeout(), new DataRateLimited()])(
  'allows history recovery after a connection error (%s)',
  async (state) => {
    const wrapper = mount(MaterialReceiptHistory, {
      props: {
        state,
        retry: async () => {
          await wrapper.setProps({ state: new DataSuccess({ data: [] }) });
        },
      },
    });
    expect(wrapper.get('[role="alert"]').text()).toBe(state.error?.displayMessage);
    await wrapper.get('button').trigger('click');
    await flushPromises();
    expect(wrapper.text()).toContain('No Receipts');
    expect(wrapper.find('[role="alert"]').exists()).toBe(false);
    wrapper.unmount();
  },
);
