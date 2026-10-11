import PrimeVue from 'primevue/config';
import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import NetworkService from '@/base/Core/NetworkStructure/networking/networkService';
import { transportProbe } from '../../../data/api/__tests__/schedule.transport.fixtures';
import ScheduleGroupForm from '../ScheduleGroupForm.vue';
import ScheduleController from '../../controllers/schedule.controller';
import { groupFixture } from '../../controllers/__tests__/fixtures';
beforeEach(() => {
  ScheduleController.getInstance().release();
  const response = transportProbe();
  response.data = { status: false, message: 'Save rejected' };
  vi.spyOn(NetworkService.instance, 'post').mockResolvedValue(response);
});
afterEach(() => {
  ScheduleController.getInstance().release();
  vi.restoreAllMocks();
});
const globals = {
  plugins: [PrimeVue],
  mocks: { $t: (key: string) => key },
  stubs: { ScheduleStageSelector: true },
};
it('restores edit IDs absent from lookup pages and preserves all values after a failed save', async () => {
  const controller = ScheduleController.getInstance();
  controller.release();
  controller.activate(101, 201);
  const wrapper = mount(ScheduleGroupForm, {
    props: { quoteId: 101, group: groupFixture() },
    global: globals,
  });
  expect(wrapper.findComponent({ name: 'ScheduleStageSelector' }).props('modelValue')).toEqual([
    expect.objectContaining({ quoteStageId: 10, children: [11] }),
  ]);
  await wrapper.find('#schedule-title').setValue('Changed title');
  await wrapper.find('form').trigger('submit');
  await flushPromises();
  expect(wrapper.find<HTMLInputElement>('#schedule-title').element.value).toBe('Changed title');
  expect(wrapper.find<HTMLInputElement>('#schedule-duration').element.value).toBe('6');
  expect(wrapper.emitted('saved')).toBeUndefined();
  expect(wrapper.text()).toContain('Save rejected');
  wrapper.unmount();
  controller.release();
});
it('cancel emits without submitting a mutation', async () => {
  const wrapper = mount(ScheduleGroupForm, { props: { quoteId: 101 }, global: globals });
  const cancel = wrapper.get('button.btn-secondary');
  await cancel.trigger('click');
  expect(wrapper.emitted('cancel')).toHaveLength(1);
  expect(wrapper.emitted('saved')).toBeUndefined();
  expect(NetworkService.instance.post).not.toHaveBeenCalled();
  wrapper.unmount();
});
