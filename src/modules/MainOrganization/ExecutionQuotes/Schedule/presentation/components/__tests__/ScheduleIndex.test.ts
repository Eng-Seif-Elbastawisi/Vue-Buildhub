import { nextTick } from 'vue';
import { expect, it } from 'vitest';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import ExecutionQuoteShowModel from '../../../../core/models/execution.quote.show.model';
import ScheduleGroupModel from '../../../core/models/schedule.group.model';
import ScheduleController from '../../controllers/schedule.controller';
import { groupFixture } from '../../controllers/__tests__/fixtures';
import ScheduleIndex from '../ScheduleIndex.vue';
import { mountScheduleRoute } from './routeHarness';
it('loads index on direct navigation without relying on an earlier Index visit', async () => {
  const { wrapper, quoteRequest } = await mountScheduleRoute(ScheduleIndex, '/schedule/101');
  expect(wrapper.text()).toContain('Main Execution Timeline');
  wrapper.unmount();
  quoteRequest.mockRestore();
});
it('shows Quote approval separately from independent Group work actions', async () => {
  const { wrapper, quoteRequest } = await mountScheduleRoute(ScheduleIndex, '/schedule/101');
  const controller = ScheduleController.getInstance();
  controller.ownerState.value = new DataSuccess({
    data: new ExecutionQuoteShowModel({
      id: 101,
      timelineStatus: 3,
      approvedByEmployeeId: 7,
      timelineNote: 'Approved',
    }),
  });
  controller.listState.value = new DataSuccess({
    data: [
      new ScheduleGroupModel({ ...groupFixture(201), workStatus: 1 }),
      new ScheduleGroupModel({ ...groupFixture(202), workStatus: null }),
    ],
  });
  await nextTick();
  expect(wrapper.get('.schedule__approval').text()).toContain('schedule.approval_3');
  expect(wrapper.get('.schedule__approval').text()).toContain('schedule.approved_by_id');
  expect(wrapper.find('.schedule__approval-actions').exists()).toBe(false);
  expect(wrapper.findAll('.schedule__work-badge').map((item) => item.text())).toEqual([
    'schedule.work_1',
    'schedule.work_unstarted',
  ]);
  expect(
    wrapper.findAll('button').filter((button) => button.text() === 'schedule.manage_work'),
  ).toHaveLength(2);
  wrapper.unmount();
  quoteRequest.mockRestore();
});

it('offers both actions while pending and opens their respective confirmations', async () => {
  const { wrapper, quoteRequest } = await mountScheduleRoute(ScheduleIndex, '/schedule/101');
  const controller = ScheduleController.getInstance();
  controller.ownerState.value = new DataSuccess({
    data: new ExecutionQuoteShowModel({ id: 101, timelineStatus: 1 }),
  });
  await nextTick();
  const accept = wrapper.get('.schedule__approval-actions .action--approve');
  const reject = wrapper.get('.schedule__approval-actions .btn-danger');
  expect(accept.attributes('disabled')).toBeUndefined();
  expect(reject.attributes('disabled')).toBeUndefined();
  await accept.trigger('click');
  expect(wrapper.text()).toContain('schedule.accept_approval_confirmation');
  expect(wrapper.find('#schedule-approval-target').exists()).toBe(false);
  await wrapper.get('form .schedule__dialog-actions button[type="button"]').trigger('click');
  await reject.trigger('click');
  expect(wrapper.text()).toContain('schedule.reject_approval_confirmation');
  expect(wrapper.get('form button[type="submit"]').classes()).toContain('btn-danger');
  controller.busy.value = true;
  await nextTick();
  expect(wrapper.get('form button[type="submit"]').attributes('disabled')).toBeDefined();
  wrapper.unmount();
  quoteRequest.mockRestore();
});

it('shows Cancelled and offers no approval actions for a cancelled timeline', async () => {
  const { wrapper, quoteRequest } = await mountScheduleRoute(ScheduleIndex, '/schedule/101');
  ScheduleController.getInstance().ownerState.value = new DataSuccess({
    data: new ExecutionQuoteShowModel({ id: 101, timelineStatus: 2 }),
  });
  await nextTick();
  expect(wrapper.get('.schedule__approval-status').text()).toBe('schedule.approval_2');
  expect(wrapper.find('.schedule__approval-actions').exists()).toBe(false);
  wrapper.unmount();
  quoteRequest.mockRestore();
});
