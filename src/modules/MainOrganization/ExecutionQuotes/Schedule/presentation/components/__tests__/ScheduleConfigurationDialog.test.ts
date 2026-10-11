import { mount } from '@vue/test-utils';
import { expect, it } from 'vitest';
import ScheduleConfigurationDialog from '../ScheduleConfigurationDialog.vue';
import ScheduleSettingsModel from '../../../core/models/schedule.settings.model';

it.each([
  { holidays: [4], label: 'schedule.weekday_4' },
  { holidays: [], label: 'schedule.no_holidays' },
])(
  'shows saved holidays $holidays in a read-only dialog that can close',
  async ({ holidays, label }) => {
    const wrapper = mount(ScheduleConfigurationDialog, {
      props: { settings: new ScheduleSettingsModel('2026-10-29', holidays) },
      global: {
        mocks: { $t: (key: string) => key },
        stubs: { Dialog: { template: '<section><slot /><slot name="footer" /></section>' } },
      },
    });
    expect(wrapper.text()).toContain('2026-10-29');
    expect(wrapper.text()).toContain(label);
    expect(wrapper.find('input').exists()).toBe(false);
    await wrapper.get('button').trigger('click');
    expect(wrapper.emitted('close')).toHaveLength(1);
    wrapper.unmount();
  },
);
