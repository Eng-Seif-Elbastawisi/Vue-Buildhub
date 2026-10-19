import { mount } from '@vue/test-utils';
import { expect, it } from 'vitest';
import AnalyticsKpiCard from '../AnalyticsKpiCard.vue';
it('renders authoritative zero, unavailable failure with Retry and a source skeleton distinctly', async () => {
  const wrapper = mount(AnalyticsKpiCard, {
    props: { title: 'Reports', value: 0, note: 'Period', to: '/work-items' },
    global: {
      mocks: { $t: (key: string) => key },
      stubs: { RouterLink: { template: '<a><slot /></a>' } },
    },
  });
  expect(wrapper.get('strong').text()).toBe('0');
  await wrapper.setProps({ failed: true });
  expect(wrapper.get('strong').text()).toBe('intelligence.unavailable');
  await wrapper.get('button').trigger('click');
  expect(wrapper.emitted('retry')).toHaveLength(1);
  await wrapper.setProps({ loading: true });
  expect(wrapper.find('strong').exists()).toBe(false);
});
