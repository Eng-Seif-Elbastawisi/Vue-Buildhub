import { flushPromises, mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import PrimeVue from 'primevue/config';
import { afterEach, expect, it, vi } from 'vitest';
import {
  DataSuccess,
  DataFailed,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { ErrorModel, ErrorType } from '@/base/Core/NetworkStructure/Resources/errors/errorModel';
import type ScheduleGroupModel from '../../../core/models/schedule.group.model';
import ProjectTimelineHistoryModel from '../../../core/models/project.timeline.history.model';
import ScheduleRepository from '../../../data/repositories/schedule.repository';
import ScheduleController from '../../controllers/schedule.controller';
import { groupFixture } from '../../controllers/__tests__/fixtures';
import ScheduleWorkHistoryDialog from '../ScheduleWorkHistoryDialog.vue';

const controller = ScheduleController.getInstance();
afterEach(() => {
  vi.restoreAllMocks();
  controller.release();
});
function mountHistory(group: ScheduleGroupModel, locale: 'en' | 'ar' = 'en') {
  return mount(ScheduleWorkHistoryDialog, {
    props: { group },
    global: {
      plugins: [PrimeVue, createI18n({ legacy: false, locale, missingWarn: false })],
      mocks: { $t: (key: string) => key },
      stubs: { Dialog: { template: '<section><slot /></section>' } },
    },
  });
}
it('fetches only the selected Group and displays actual history with nullable fields in Arabic', async () => {
  controller.release();
  controller.activate(140);
  const group = groupFixture(201);
  controller.listState.value = new DataSuccess({ data: [group] });
  const request = vi
    .spyOn(ScheduleRepository.getInstance(), 'readHistory')
    .mockResolvedValue(
      new DataSuccess({
        data: [new ProjectTimelineHistoryModel(1, 201, 1, null, null, null, '2026-10-18 12:10:58')],
      }),
    );
  const wrapper = mountHistory(group, 'ar');
  await flushPromises();
  expect(wrapper.get('section').attributes('dir')).toBe('rtl');
  expect(request.mock.calls[0]?.[0].toMap()).toEqual({ project_timeline_id: 201 });
  expect(wrapper.text()).toContain('2026-10-18 12:10:58');
  expect(wrapper.text()).toContain('schedule.work_1');
  expect(wrapper.text()).toContain('schedule.not_available');
  expect(wrapper.text()).not.toContain('schedule.reason_1');
  wrapper.unmount();
});
it('shows empty and error states without inventing history entries', async () => {
  controller.release();
  controller.activate(140);
  const group = groupFixture(201);
  controller.listState.value = new DataSuccess({ data: [group] });
  const read = vi
    .spyOn(ScheduleRepository.getInstance(), 'readHistory')
    .mockResolvedValueOnce(new DataSuccess({ data: [] }))
    .mockResolvedValueOnce(
      new DataFailed({ error: new ErrorModel('History failed', ErrorType.serviceSide) }),
    );
  const wrapper = mountHistory(group);
  await flushPromises();
  expect(wrapper.text()).toContain('schedule.no_work_history');
  await controller.readHistory(201);
  await flushPromises();
  expect(read).toHaveBeenCalledTimes(2);
  expect(wrapper.text()).toContain('History failed');
  wrapper.unmount();
});
it('sorts returned records by parsed timestamp before rendering', async () => {
  controller.release();
  controller.activate(140);
  const group = groupFixture(201);
  controller.listState.value = new DataSuccess({ data: [group] });
  vi.spyOn(ScheduleRepository.getInstance(), 'readHistory').mockResolvedValue(new DataSuccess({ data: [
    new ProjectTimelineHistoryModel(1, 201, 1, null, null, null, '2026-10-18 12:10:58'),
    new ProjectTimelineHistoryModel(2, 201, 2, 1, 'Paused', null, '2026-10-18 12:12:50'),
  ] }));
  const wrapper = mountHistory(group);
  await flushPromises();
  expect(wrapper.findAll('ol li').map((item) => item.text())).toEqual([
    expect.stringContaining('2026-10-18 12:12:50'),
    expect.stringContaining('2026-10-18 12:10:58'),
  ]);
  expect(wrapper.text()).toContain('schedule.reason_1');
  expect(wrapper.text()).toContain('Paused');
  wrapper.unmount();
});
