import { mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import { expect, it } from 'vitest';
import en from '@/locales/en.json';
import DailyReportsActivityChart from '../DailyReportsActivityChart.vue';
it('preserves numeric points in flat mode and provides every daily value without hover', async () => {
  const i18n = createI18n({ legacy: false, locale: 'en', messages: { en } });
  const wrapper = mount(DailyReportsActivityChart, {
    props: {
      flat: false,
      buckets: [
        { key: '2026-10-18', label: '2026-10-18', count: 0 },
        { key: '2026-10-19', label: '2026-10-19', count: 3 },
      ],
    },
    global: { plugins: [i18n], mocks: { $t: i18n.global.t } },
  });
  await wrapper.get('svg').trigger('focus');
  await wrapper.get('svg').trigger('keydown', { key: 'ArrowRight' });
  expect(wrapper.get('[role="status"]').text()).toContain('2026-10-19: 3');
  const points = wrapper.get('polyline').attributes('points');
  expect(points).toBe('30,170 404,25');
  expect(wrapper.findAll('tbody td').map((cell) => cell.text())).toEqual(['0', '3']);
  expect(wrapper.find('polygon').exists()).toBe(true);
  await wrapper.setProps({ flat: true });
  expect(wrapper.find('polygon').exists()).toBe(false);
  expect(wrapper.get('polyline').attributes('points')).toBe(points);
  await wrapper.setProps({ buckets: [] });
  expect(wrapper.text()).toContain(en.intelligence.empty);
  expect(wrapper.find('svg').exists()).toBe(false);
});
