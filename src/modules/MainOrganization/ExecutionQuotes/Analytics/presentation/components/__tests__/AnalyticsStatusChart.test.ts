import { mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import { expect, it } from 'vitest';
import en from '@/locales/en.json';
import ar from '@/locales/ar.json';
import AnalyticsStatusChart from '../AnalyticsStatusChart.vue';
it.each(['en', 'ar'])(
  'keeps depth decorative and legend, tooltip and table consistent in %s',
  async (locale) => {
    const wrapper = mount(AnalyticsStatusChart, {
      props: {
        title: 'Timeline',
        flat: false,
        buckets: [
          { key: 'start', label: 'intelligence.start', count: 8 },
          { key: 'hold', label: 'intelligence.hold', count: 4 },
        ],
      },
      global: { plugins: [createI18n({ legacy: false, locale, messages: { en, ar } })] },
    });
    const widths = wrapper.findAll('.chart-bar').map((bar) => bar.attributes('width'));
    expect(widths).toEqual(['380', '190']);
    expect(wrapper.findAll('tbody td').map((cell) => cell.text())).toEqual(['8', '4']);
    await wrapper.findAll('button')[1]?.trigger('focus');
    expect(wrapper.get('[role="status"]').text()).toContain('4');
    expect(wrapper.get('[role="status"]').text()).toContain(locale === 'ar' ? 'تعليق' : 'HOLD');
    await wrapper.setProps({ flat: true });
    expect(wrapper.classes()).toContain('status-chart--flat');
    expect(wrapper.findAll('.chart-bar').map((bar) => bar.attributes('width'))).toEqual(widths);
    expect(wrapper.findAll('button strong').map((cell) => cell.text())).toEqual(['8', '4']);
  },
);
