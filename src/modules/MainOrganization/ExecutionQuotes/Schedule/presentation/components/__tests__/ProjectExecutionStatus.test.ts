import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { createI18n } from 'vue-i18n';
import {
  DataFailed,
  DataSuccess,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { ErrorModel, ErrorType } from '@/base/Core/NetworkStructure/Resources/errors/errorModel';
import ScheduleSettingsModel from '../../../core/models/schedule.settings.model';
import ScheduleController from '../../controllers/schedule.controller';
import ScheduleRepository from '../../../data/repositories/schedule.repository';
import ProjectExecutionStatus from '../ProjectExecutionStatus.vue';

const controller = ScheduleController.getInstance();
function configuration(status: 1 | 2 | 3 | null = null) {
  return ScheduleSettingsModel.fromJson({
    id: 1,
    work_status: status,
    responsible_employee_id: status ? 9 : null,
    responsible_employee: status ? { id: 9, name: 'Engineer', type: 4 } : null,
    start_date: '2026-10-29',
    delivery_date: '2026-12-01',
    holidays: [4],
  });
}
function render() {
  return mount(ProjectExecutionStatus, {
    props: { quoteId: 140 },
    global: {
      plugins: [
        createI18n({ legacy: false, locale: 'en', missingWarn: false, fallbackWarn: false }),
      ],
      mocks: { $t: (key: string) => key },
      stubs: {
        Dialog: { template: '<section data-test="start-dialog"><slot /></section>' },
        UpdatedCustomInputSelect: {
          props: ['modelValue', 'id'],
          emits: ['update:modelValue'],
          template:
            '<button type="button" :id="id" @click="$emit(\'update:modelValue\', { id: 9, title: \'Engineer\' })">{{ modelValue?.title ?? "choose" }}</button>',
        },
      },
    },
  });
}
beforeEach(() => {
  controller.release();
  controller.activate(140);
  controller.settingsState.value = new DataSuccess({ data: configuration() });
});
afterEach(() => {
  vi.restoreAllMocks();
  controller.release();
});

it.each([
  [null, 'project_execution.not_started', ['project_execution.start']],
  [1, 'project_execution.status_1', ['project_execution.hold', 'project_execution.stop']],
  [2, 'project_execution.status_2', ['project_execution.resume']],
  [3, 'project_execution.status_3', ['project_execution.resume']],
] as const)('shows status %s and only the permitted project actions', (status, label, actions) => {
  controller.settingsState.value = new DataSuccess({ data: configuration(status) });
  const wrapper = render();
  expect(wrapper.text()).toContain(label);
  expect(wrapper.findAll('header button').map((button) => button.text())).toEqual(actions);
  expect(wrapper.text()).toContain('2026-10-29');
  expect(wrapper.text()).toContain('2026-12-01');
  if (status) expect(wrapper.text()).toContain('Engineer');
  wrapper.unmount();
});

it('opens the existing configuration flow when configuration is missing', async () => {
  controller.settingsState.value = new DataSuccess({ data: null });
  const wrapper = render();
  expect(wrapper.text()).toContain('project_execution.configuration_required');
  expect(wrapper.find('header button').exists()).toBe(false);
  await wrapper.get('button').trigger('click');
  expect(wrapper.emitted('configure')).toHaveLength(1);
  wrapper.unmount();
});

it('requires selection, keeps the dialog and employee after backend rejection, and does not mark requirements complete', async () => {
  const change = vi
    .spyOn(ScheduleRepository.getInstance(), 'changeProjectConfigurationWorkStatus')
    .mockResolvedValue(
      new DataFailed({
        error: new ErrorModel('Shop Drawing required', ErrorType.validation, {
          validationErrors: {
            responsible_employee_id: ['Employee must belong to this Organization'],
          },
        }),
      }),
    );
  const wrapper = render();
  await wrapper.get('header button').trigger('click');
  await wrapper.get('form').trigger('submit');
  expect(wrapper.text()).toContain('project_execution.employee_required');
  expect(change).not.toHaveBeenCalled();
  expect(wrapper.text()).toContain('project_execution.payment_requirement');
  expect(wrapper.text()).toContain('project_execution.drawing_requirement');
  expect(wrapper.find('input[type="checkbox"]').exists()).toBe(false);
  await wrapper.get('#project-execution-employee').trigger('click');
  await wrapper.get('form').trigger('submit');
  await flushPromises();
  expect(change.mock.calls[0]?.[0].toMap()).toEqual({
    quote_id: 140,
    work_status: 1,
    responsible_employee_id: 9,
  });
  expect(wrapper.find('[data-test="start-dialog"]').exists()).toBe(true);
  expect(wrapper.get('#project-execution-employee').text()).toBe('Engineer');
  expect(wrapper.text()).toContain('Shop Drawing required');
  expect(wrapper.text()).toContain('Employee must belong to this Organization');
  expect(wrapper.text()).toContain('project_execution.not_started');
  wrapper.unmount();
});

it('submits START once, closes only on success, and displays authoritative project state', async () => {
  let finish!: (value: DataSuccess<ScheduleSettingsModel>) => void;
  const updated = configuration(1);
  const change = vi
    .spyOn(ScheduleRepository.getInstance(), 'changeProjectConfigurationWorkStatus')
    .mockReturnValue(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
  vi.spyOn(ScheduleRepository.getInstance(), 'readSettings').mockResolvedValue(
    new DataSuccess({ data: updated }),
  );
  const wrapper = render();
  await wrapper.get('header button').trigger('click');
  await wrapper.get('#project-execution-employee').trigger('click');
  await wrapper.get('form').trigger('submit');
  await wrapper.get('form').trigger('submit');
  expect(change).toHaveBeenCalledTimes(1);
  expect(wrapper.find('[data-test="start-dialog"]').exists()).toBe(true);
  finish(new DataSuccess({ data: updated, message: 'Project started successfully' }));
  await flushPromises();
  expect(wrapper.find('[data-test="start-dialog"]').exists()).toBe(false);
  expect(wrapper.text()).toContain('project_execution.status_1');
  expect(wrapper.text()).toContain('Project started successfully');
  wrapper.unmount();
});

it.each([
  [1, 2, 'project_execution.hold'],
  [1, 3, 'project_execution.stop'],
  [2, 1, 'project_execution.resume'],
  [3, 1, 'project_execution.resume'],
] as const)(
  'sends the Project action from status %s to %s without clearing the assigned employee',
  async (current, target, action) => {
    controller.settingsState.value = new DataSuccess({ data: configuration(current) });
    const updated = configuration(target);
    const change = vi
      .spyOn(ScheduleRepository.getInstance(), 'changeProjectConfigurationWorkStatus')
      .mockResolvedValue(new DataSuccess({ data: updated }));
    vi.spyOn(ScheduleRepository.getInstance(), 'readSettings').mockResolvedValue(
      new DataSuccess({ data: updated }),
    );
    const wrapper = render();
    const button = wrapper.findAll('header button').find((button) => button.text() === action);
    expect(button).toBeDefined();
    await button?.trigger('click');
    await flushPromises();
    expect(change.mock.calls[0]?.[0].toMap()).toEqual({ quote_id: 140, work_status: target });
    expect(wrapper.text()).toContain(`project_execution.status_${target}`);
    expect(wrapper.text()).toContain('Engineer');
    expect(wrapper.find('[data-test="start-dialog"]').exists()).toBe(false);
    wrapper.unmount();
  },
);
