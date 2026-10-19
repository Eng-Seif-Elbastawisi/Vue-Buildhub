import { mount } from '@vue/test-utils';
import { expect, it } from 'vitest';
import {
  DataSuccess,
  DataLoading,
  DataFailed,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { ErrorModel, ErrorType } from '@/base/Core/NetworkStructure/Resources/errors/errorModel';
import AnalyticsPanel from '../AnalyticsPanel.vue';
it('keeps loading, failed, unsupported and populated panels distinct', async () => {
  const wrapper = mount(AnalyticsPanel, {
    props: { title: 'Reports', note: 'Period', state: new DataLoading() },
    slots: { default: 'Measured data' },
    global: { mocks: { $t: (key: string) => key } },
  });
  expect(wrapper.attributes('aria-busy')).toBe('true');
  expect(wrapper.text()).not.toContain('Measured data');
  await wrapper.setProps({
    state: new DataFailed({ error: new ErrorModel('Denied', ErrorType.serviceSide) }),
  });
  expect(wrapper.text()).toContain('intelligence.load_error');
  await wrapper.get('button').trigger('click');
  expect(wrapper.emitted('retry')).toHaveLength(1);
  await wrapper.setProps({ state: new DataSuccess({ data: [] }), available: false });
  expect(wrapper.text()).toContain('intelligence.unavailable');
  expect(wrapper.text()).not.toContain('Measured data');
  await wrapper.setProps({ available: true });
  expect(wrapper.text()).toContain('Measured data');
});
