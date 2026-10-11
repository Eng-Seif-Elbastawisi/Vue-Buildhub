import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import NetworkService from '@/base/Core/NetworkStructure/networking/networkService';
import { transportProbe } from '../../../data/api/__tests__/schedule.transport.fixtures';
import ScheduleSettingsDialog from '../ScheduleSettingsDialog.vue';
import ScheduleSettingsModel from '../../../core/models/schedule.settings.model';
import ScheduleController from '../../controllers/schedule.controller';
beforeEach(() => {
  const response = transportProbe();
  response.data = { status: false, message: 'Save rejected' };
  vi.spyOn(NetworkService.instance, 'post').mockResolvedValue(response);
});
afterEach(() => {
  ScheduleController.getInstance().release();
  vi.restoreAllMocks();
});
const globals = {
  mocks: { $t: (key: string) => key },
  stubs: { Dialog: { template: '<section><slot /></section>' } },
};
it('keeps selected weekdays enabled at the limit and allows deselection and zero days', async () => {
  const wrapper = mount(ScheduleSettingsDialog, {
    props: {
      quoteId: 101,
      readable: true,
      settings: new ScheduleSettingsModel('2026-10-09', [5, 6]),
    },
    global: globals,
  });
  const checkboxes = wrapper.findAll<HTMLInputElement>('input[type="checkbox"]');
  const sunday = wrapper.get<HTMLInputElement>('input[value="7"]');
  const friday = wrapper.get<HTMLInputElement>('input[value="5"]');
  const saturday = wrapper.get<HTMLInputElement>('input[value="6"]');
  expect(wrapper.find('input[value="0"]').exists()).toBe(false);
  expect(sunday.element.closest('label')?.textContent).toContain('schedule.weekday_7');
  expect(sunday.element.disabled).toBe(true);
  expect(friday.element.disabled).toBe(false);
  await friday.setValue(false);
  expect(sunday.element.disabled).toBe(false);
  await saturday.setValue(false);
  expect(checkboxes.every((checkbox) => !checkbox.element.checked)).toBe(true);
  wrapper.unmount();
});
it('preserves invalid saved weekdays without truncating and preserves date input after failed save', async () => {
  const controller = ScheduleController.getInstance();
  controller.release();
  controller.activate(101);
  const wrapper = mount(ScheduleSettingsDialog, {
    props: {
      quoteId: 101,
      readable: true,
      settings: new ScheduleSettingsModel('2026-10-09', [1, 2, 3]),
    },
    global: globals,
  });
  expect(
    wrapper
      .findAll<HTMLInputElement>('input[type="checkbox"]')
      .filter((input) => input.element.checked),
  ).toHaveLength(3);
  await wrapper.find('form').trigger('submit');
  expect(wrapper.find('[role="alert"]').exists()).toBe(true);
  await wrapper.get('input[value="3"]').setValue(false);
  await wrapper.find('form').trigger('submit');
  await flushPromises();
  expect(wrapper.find<HTMLInputElement>('input[type="date"]').element.value).toBe('2026-10-09');
  expect(wrapper.emitted('close')).toBeUndefined();
  wrapper.unmount();
  controller.release();
});
