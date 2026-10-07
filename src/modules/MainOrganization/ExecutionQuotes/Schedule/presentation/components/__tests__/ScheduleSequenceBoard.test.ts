import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import {
  DataSuccess,
  DataFailed,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { ErrorModel, ErrorType } from '@/base/Core/NetworkStructure/Resources/errors/errorModel';
import ScheduleSequenceBoard from '../ScheduleSequenceBoard.vue';
import ScheduleController from '../../controllers/schedule.controller';
import ScheduleRepository from '../../../data/repositories/schedule.repository';
import ScheduleSettingsModel from '../../../core/models/schedule.settings.model';
import { groupFixture, overviewFixture } from '../../controllers/__tests__/fixtures';
const controller = ScheduleController.getInstance();
const repository = ScheduleRepository.getInstance();
const groups = () => [groupFixture(201), groupFixture(202), groupFixture(203)];
beforeEach(() => {
  controller.release();
  controller.activate(101);
  controller.listState.value = new DataSuccess({ data: groups() });
  controller.completeSequence.value = true;
  vi.spyOn(repository, 'readSettings').mockResolvedValue(
    new DataSuccess({ data: new ScheduleSettingsModel(undefined, []) }),
  );
});
afterEach(() => {
  vi.restoreAllMocks();
  controller.release();
});
const board = () =>
  mount(ScheduleSequenceBoard, {
    props: { groups: groups(), basePath: '/schedule/101', quoteId: 101 },
    attrs: { dir: 'rtl' },
    global: {
      mocks: { $t: (key: string) => key },
      stubs: { RouterLink: { template: '<a><slot /></a>' } },
    },
  });
it('drags only via handles, shows an insertion slot and sends one numeric move in RTL', async () => {
  const move = vi
    .spyOn(repository, 'changeProjectTimelineOrder')
    .mockResolvedValue(new DataSuccess({}));
  vi.spyOn(repository, 'readOverview').mockResolvedValue(
    new DataSuccess({
      data: overviewFixture([groupFixture(203), groupFixture(201), groupFixture(202)]),
    }),
  );
  vi.spyOn(repository, 'readSettings').mockResolvedValue(
    new DataSuccess({ data: new ScheduleSettingsModel(undefined, []) }),
  );
  const wrapper = board();
  expect(wrapper.find('article[draggable]').exists()).toBe(false);
  expect(wrapper.findAll('.schedule__drag-handle')).toHaveLength(3);
  await wrapper.findAll('.schedule__drag-handle')[2].trigger('dragstart');
  await wrapper.get('[data-slot="0"]').trigger('dragover');
  expect(wrapper.find('.schedule__drop-slot--active').text()).toBe('schedule.drop_here');
  await wrapper.get('[data-slot="0"]').trigger('drop');
  await flushPromises();
  expect(move.mock.calls[0][0].toMap()).toEqual({ project_timeline_id: 203, order: 1 });
  expect(controller.listState.value.data?.map((group) => group.id)).toEqual([203, 201, 202]);
  wrapper.unmount();
});
it('keeps mobile/keyboard buttons and rolls back a failed local preview without a fake save', async () => {
  const move = vi
    .spyOn(repository, 'changeProjectTimelineOrder')
    .mockResolvedValue(new DataFailed({ error: new ErrorModel('Rejected', ErrorType.validation) }));
  const wrapper = board();
  const cards = wrapper.findAll('article');
  const firstEarlier = cards[0]
    .findAll('button')
    .find((button) => button.text() === 'schedule.earlier');
  expect(firstEarlier?.attributes('disabled')).toBeDefined();
  const lastLater = cards[2].findAll('button').find((button) => button.text() === 'schedule.later');
  expect(lastLater?.attributes('disabled')).toBeDefined();
  const earlier = cards[1].findAll('button').find((button) => button.text() === 'schedule.earlier');
  if (!earlier) throw new Error('Earlier control missing');
  await earlier.trigger('click');
  await flushPromises();
  expect(move.mock.calls[0][0].toMap()).toEqual({ project_timeline_id: 202, order: 1 });
  expect(controller.listState.value.data?.map((group) => group.id)).toEqual([201, 202, 203]);
  expect(wrapper.find('[role="status"]').exists()).toBe(false);
  wrapper.unmount();
});
it('blocks a second move and keeps saved-order feedback separate from a read refresh failure', async () => {
  let finish!: (state: DataSuccess<void>) => void;
  const move = vi.spyOn(repository, 'changeProjectTimelineOrder').mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  vi.spyOn(repository, 'readOverview').mockResolvedValue(
    new DataFailed({ error: new ErrorModel('Read failed', ErrorType.networkConnection) }),
  );
  const wrapper = board();
  await wrapper.findAll('.schedule__drag-handle')[1].trigger('dragstart');
  await wrapper.get('[data-slot="0"]').trigger('drop');
  expect(wrapper.text()).toContain('schedule.saving_order');
  for (const button of wrapper.findAll('.schedule__drag-handle'))
    expect(button.attributes('disabled')).toBeDefined();
  await controller.changeProjectTimelineOrder(203, 1);
  expect(move).toHaveBeenCalledOnce();
  finish(new DataSuccess({}));
  await flushPromises();
  expect(controller.refreshFailed.value).toBe(true);
  expect(controller.mutationState.value).toBeInstanceOf(DataSuccess);
  expect(wrapper.text()).toContain('schedule.order_saved');
  wrapper.unmount();
});
