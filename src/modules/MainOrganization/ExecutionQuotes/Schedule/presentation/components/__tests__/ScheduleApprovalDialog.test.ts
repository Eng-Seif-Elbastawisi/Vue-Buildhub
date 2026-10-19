import { mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import PrimeVue from 'primevue/config';
import { expect, it, vi } from 'vitest';
import {
  DataFailed,
  DataSuccess,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { ErrorModel, ErrorType } from '@/base/Core/NetworkStructure/Resources/errors/errorModel';
import ExecutionQuoteShowModel from '../../../../core/models/execution.quote.show.model';
import ScheduleController from '../../controllers/schedule.controller';
import ScheduleApprovalDialog from '../ScheduleApprovalDialog.vue';

it('confirms Accept with the numeric approved status and preserves the note after a failed submission', async () => {
  const controller = ScheduleController.getInstance();
  controller.release();
  controller.activate(140);
  controller.ownerState.value = new DataSuccess({
    data: new ExecutionQuoteShowModel({ id: 140, timelineStatus: 1 }),
  });
  const failure = new DataFailed({
    error: new ErrorModel('Approval failed', ErrorType.serviceSide),
  });
  const changeApproval = vi.spyOn(controller, 'changeApproval').mockImplementation(async () => {
    controller.approvalState.value = failure;
    return failure;
  });
  const wrapper = mount(ScheduleApprovalDialog, {
    props: { quoteId: 140, targetStatus: 3 },
    global: {
      plugins: [PrimeVue, createI18n({ legacy: false, locale: 'ar', missingWarn: false })],
      mocks: { $t: (key: string) => key },
      stubs: {
        Dialog: { template: '<section><slot /></section>' },
      },
    },
  });
  expect(wrapper.text()).toContain('schedule.current_approval');
  expect(wrapper.text()).toContain('schedule.approval_1');
  expect(wrapper.get('section').attributes('dir')).toBe('rtl');
  expect(wrapper.find('#schedule-approval-target').exists()).toBe(false);
  expect(wrapper.find('#schedule-approval-note').exists()).toBe(true);
  expect(wrapper.find('form').exists()).toBe(true);
  expect(wrapper.text()).toContain('schedule.accept_approval_confirmation');
  await wrapper.get('#schedule-approval-note').setValue('Timeline approved.');
  await wrapper.get('form').trigger('submit');
  expect(changeApproval).toHaveBeenCalledOnce();
  expect(changeApproval.mock.calls[0][0].toMap()).toEqual({
    quote_id: 140,
    timeline_status: 3,
    timeline_note: 'Timeline approved.',
  });
  expect(wrapper.get('#schedule-approval-note').element).toHaveProperty(
    'value',
    'Timeline approved.',
  );
  expect(wrapper.text()).toContain('Approval failed');
  expect(wrapper.emitted('close')).toBeUndefined();
  changeApproval.mockResolvedValueOnce(
    new DataSuccess({ data: new ExecutionQuoteShowModel({ id: 140, timelineStatus: 3 }) }),
  );
  await wrapper.get('form').trigger('submit');
  expect(wrapper.emitted('close')).toHaveLength(1);
  wrapper.unmount();
  changeApproval.mockRestore();
  controller.release();
});

it('confirms Reject with the numeric cancelled status and keeps the note after failure', async () => {
  const controller = ScheduleController.getInstance();
  controller.release();
  controller.activate(142);
  controller.ownerState.value = new DataSuccess({
    data: new ExecutionQuoteShowModel({ id: 142, timelineStatus: 1 }),
  });
  const failure = new DataFailed({
    error: new ErrorModel('Rejection denied', ErrorType.serviceSide),
  });
  const changeApproval = vi.spyOn(controller, 'changeApproval').mockImplementation(async () => {
    controller.approvalState.value = failure;
    return failure;
  });
  const wrapper = mount(ScheduleApprovalDialog, {
    props: { quoteId: 142, targetStatus: 2 },
    global: {
      plugins: [PrimeVue, createI18n({ legacy: false, locale: 'en', missingWarn: false })],
      mocks: { $t: (key: string) => key },
      stubs: { Dialog: { template: '<section><slot /></section>' } },
    },
  });
  expect(wrapper.text()).toContain('schedule.reject_approval_confirmation');
  expect(wrapper.get('button[type="submit"]').classes()).toContain('btn-danger');
  await wrapper.get('#schedule-approval-note').setValue('Needs revision');
  await wrapper.get('form').trigger('submit');
  expect(changeApproval.mock.calls[0][0].toMap()).toEqual({
    quote_id: 142,
    timeline_status: 2,
    timeline_note: 'Needs revision',
  });
  expect(controller.ownerState.value.data?.timelineStatus).toBe(1);
  expect(wrapper.get('#schedule-approval-note').element).toHaveProperty('value', 'Needs revision');
  expect(wrapper.text()).toContain('Rejection denied');
  expect(wrapper.emitted('close')).toBeUndefined();
  wrapper.unmount();
  changeApproval.mockRestore();
  controller.release();
});
