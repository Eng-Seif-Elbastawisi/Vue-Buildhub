import { flushPromises, mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import PrimeVue from 'primevue/config';
import { expect, it, vi } from 'vitest';
import {
  DataSuccess,
  DataFailed,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { ErrorModel, ErrorType } from '@/base/Core/NetworkStructure/Resources/errors/errorModel';
import ExecutionQuoteShowModel from '../../../../core/models/execution.quote.show.model';
import ScheduleGroupModel from '../../../core/models/schedule.group.model';
import ScheduleController from '../../controllers/schedule.controller';
import { groupFixture } from '../../controllers/__tests__/fixtures';
import ScheduleWorkStatusDialog from '../ScheduleWorkStatusDialog.vue';

it('shows the selected Group status and optional reason and note controls', async () => {
  const controller = ScheduleController.getInstance();
  controller.release();
  controller.activate(140);
  controller.ownerState.value = new DataSuccess({
    data: new ExecutionQuoteShowModel({ id: 140, timelineStatus: 3 }),
  });
  const group = new ScheduleGroupModel({ ...groupFixture(201), workStatus: null });
  const wrapper = mount(ScheduleWorkStatusDialog, {
    props: { group },
    global: {
      plugins: [PrimeVue, createI18n({ legacy: false, locale: 'en', missingWarn: false })],
      mocks: { $t: (key: string) => key },
      stubs: {
        Dialog: { template: '<section><slot /></section>' },
        UpdatedCustomInputSelect: true,
      },
    },
  });
  expect(wrapper.text()).toContain('schedule.work_unstarted');
  expect(wrapper.findAllComponents({ name: 'UpdatedCustomInputSelect' })).toHaveLength(2);
  expect(wrapper.find('#schedule-work-note').exists()).toBe(true);
  wrapper.unmount();
  controller.release();
});
it('keeps the selected status and note after a rejected transition', async () => {
  const controller = ScheduleController.getInstance();
  controller.release();
  controller.activate(140);
  controller.ownerState.value = new DataSuccess({
    data: new ExecutionQuoteShowModel({ id: 140, timelineStatus: 3 }),
  });
  const group = new ScheduleGroupModel({ ...groupFixture(201), workStatus: 2 });
  controller.listState.value = new DataSuccess({ data: [group] });
  const failure = new DataFailed({
    error: new ErrorModel('Transition denied', ErrorType.serviceSide),
  });
  const save = vi.spyOn(controller, 'changeWorkStatus').mockImplementation(async () => {
    controller.workStatusState.value = failure;
    return failure;
  });
  const selectStub = {
    props: ['id', 'staticOptions'],
    emits: ['update:modelValue'],
    template:
      '<button type="button" :id="id" @click="$emit(\'update:modelValue\', staticOptions[0])">choose</button>',
  };
  const wrapper = mount(ScheduleWorkStatusDialog, {
    props: { group },
    global: {
      plugins: [PrimeVue, createI18n({ legacy: false, locale: 'en', missingWarn: false })],
      mocks: { $t: (key: string) => key },
      stubs: {
        Dialog: { template: '<section><slot /></section>' },
        UpdatedCustomInputSelect: selectStub,
      },
    },
  });
  await wrapper.get('#schedule-work-target').trigger('click');
  await wrapper.get('#schedule-work-reason').trigger('click');
  expect(wrapper.text()).toContain('schedule.clear_reason');
  await wrapper
    .findAll('button')
    .find((button) => button.text() === 'schedule.clear_reason')
    ?.trigger('click');
  await wrapper.get('#schedule-work-note').setValue('Pause ended');
  await wrapper.get('form').trigger('submit');
  await flushPromises();
  expect(save.mock.calls[0]?.[0].toMap()).toEqual({
    project_timeline_id: 201,
    work_status: 1,
    reason: null,
    note: 'Pause ended',
  });
  expect(wrapper.get('#schedule-work-note').element.value).toBe('Pause ended');
  expect(wrapper.text()).toContain('Transition denied');
  expect(wrapper.emitted('close')).toBeUndefined();
  wrapper.unmount();
  vi.restoreAllMocks();
  controller.release();
});
