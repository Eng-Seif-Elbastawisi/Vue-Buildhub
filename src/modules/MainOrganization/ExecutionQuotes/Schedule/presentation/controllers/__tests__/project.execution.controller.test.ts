import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import {
  DataCancelled,
  DataFailed,
  DataSuccess,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { ErrorModel, ErrorType } from '@/base/Core/NetworkStructure/Resources/errors/errorModel';
import ExecutionQuoteShowModel from '../../../../core/models/execution.quote.show.model';
import ScheduleSettingsModel from '../../../core/models/schedule.settings.model';
import ChangeProjectConfigurationWorkStatusParams from '../../../core/params/change.project.configuration.work-status.params';
import ScheduleRepository from '../../../data/repositories/schedule.repository';
import ScheduleController from '../schedule.controller';
import { groupFixture } from './fixtures';

const controller = ScheduleController.getInstance();
const repository = ScheduleRepository.getInstance();
function configuration(workStatus: 1 | 2 | 3 | null = null, employeeId: number | null = null) {
  return ScheduleSettingsModel.fromJson({
    id: 1,
    work_status: workStatus,
    responsible_employee_id: employeeId,
    responsible_employee: employeeId ? { id: employeeId, name: 'Engineer', type: 4 } : null,
    start_date: '2026-10-29',
    delivery_date: null,
    site_condition: null,
    holidays: [4],
    created_at: '2026-10-11 08:17:42',
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

it.each([1, 2, 3] as const)(
  'blocks initial transition %s without required first START data',
  async (status) => {
    const change = vi.spyOn(repository, 'changeProjectConfigurationWorkStatus');
    expect(
      await controller.changeProjectConfigurationWorkStatus(
        new ChangeProjectConfigurationWorkStatusParams(140, status),
      ),
    ).toBeInstanceOf(DataFailed);
    expect(change).not.toHaveBeenCalled();
  },
);

it('requires a persisted configuration even when a responsible employee is selected', async () => {
  controller.settingsState.value = new DataSuccess({ data: null });
  const change = vi.spyOn(repository, 'changeProjectConfigurationWorkStatus');
  expect(
    await controller.changeProjectConfigurationWorkStatus(
      new ChangeProjectConfigurationWorkStatusParams(140, 1, 9),
    ),
  ).toBeInstanceOf(DataFailed);
  expect(change).not.toHaveBeenCalled();
});

it('starts only the Project, refreshes configuration, and leaves planned dates, approval and Groups independent', async () => {
  const group = groupFixture();
  controller.listState.value = new DataSuccess({ data: [group] });
  const previousGroups = controller.listState.value;
  const owner = new ExecutionQuoteShowModel({ id: 140, timelineStatus: 1 });
  controller.ownerState.value = new DataSuccess({ data: owner });
  const updated = configuration(1, 9);
  const change = vi
    .spyOn(repository, 'changeProjectConfigurationWorkStatus')
    .mockResolvedValue(new DataSuccess({ data: updated, message: 'Started' }));
  const read = vi
    .spyOn(repository, 'readSettings')
    .mockResolvedValue(new DataSuccess({ data: updated }));
  const groupChange = vi.spyOn(repository, 'changeWorkStatus');
  const groupRead = vi.spyOn(repository, 'readOverview');
  const approvalChange = vi.spyOn(repository, 'changeApproval');
  const result = await controller.changeProjectConfigurationWorkStatus(
    new ChangeProjectConfigurationWorkStatusParams(140, 1, 9),
  );
  expect(result).toBeInstanceOf(DataSuccess);
  expect(change.mock.calls[0]?.[0].toMap()).toEqual({
    quote_id: 140,
    work_status: 1,
    responsible_employee_id: 9,
  });
  expect(read.mock.calls[0]?.[0].toMap()).toEqual({ quote_id: 140 });
  expect(controller.settingsState.value.data).toBe(updated);
  expect(updated.startDate).toBe('2026-10-29');
  expect(controller.ownerState.value.data).toBe(owner);
  expect(controller.listState.value).toBe(previousGroups);
  expect(controller.listState.value.data?.[0]).toEqual(group);
  expect(groupChange).not.toHaveBeenCalled();
  expect(groupRead).not.toHaveBeenCalled();
  expect(approvalChange).not.toHaveBeenCalled();
  expect(controller.busy.value).toBe(false);
});

it.each([
  [1, 2],
  [1, 3],
  [2, 1],
  [3, 1],
] as const)('changes %s to %s without resending the assigned employee', async (current, target) => {
  controller.settingsState.value = new DataSuccess({ data: configuration(current, 9) });
  const updated = configuration(target, 9);
  const change = vi
    .spyOn(repository, 'changeProjectConfigurationWorkStatus')
    .mockResolvedValue(new DataSuccess({ data: updated }));
  vi.spyOn(repository, 'readSettings').mockResolvedValue(new DataSuccess({ data: updated }));
  await controller.changeProjectConfigurationWorkStatus(
    new ChangeProjectConfigurationWorkStatusParams(140, target),
  );
  expect(change.mock.calls[0]?.[0].toMap()).toEqual({ quote_id: 140, work_status: target });
  expect(controller.settingsState.value.data?.responsibleEmployeeId).toBe(9);
});

it('prevents duplicate START requests and ignores delayed responses after an owner switch', async () => {
  let finish!: (value: DataSuccess<ScheduleSettingsModel>) => void;
  const change = vi.spyOn(repository, 'changeProjectConfigurationWorkStatus').mockReturnValue(
    new Promise((resolve) => {
      finish = resolve;
    }),
  );
  const read = vi.spyOn(repository, 'readSettings');
  const first = controller.changeProjectConfigurationWorkStatus(
    new ChangeProjectConfigurationWorkStatusParams(140, 1, 9),
  );
  expect(controller.projectExecutionBusy.value).toBe(true);
  expect(
    await controller.changeProjectConfigurationWorkStatus(
      new ChangeProjectConfigurationWorkStatusParams(140, 1, 9),
    ),
  ).toBeInstanceOf(DataCancelled);
  expect(change).toHaveBeenCalledTimes(1);
  controller.activate(141);
  const next = configuration(null);
  controller.settingsState.value = new DataSuccess({ data: next });
  finish(new DataSuccess({ data: configuration(1, 9) }));
  expect(await first).toBeInstanceOf(DataCancelled);
  expect(controller.settingsState.value.data).toBe(next);
  expect(controller.projectExecutionState.value.data).toBeNull();
  expect(controller.projectExecutionBusy.value).toBe(false);
  expect(read).not.toHaveBeenCalled();
});

it('preserves the previous configuration and actual backend error on rejection without retries', async () => {
  const before = controller.settingsState.value;
  const rejection = new DataFailed<ScheduleSettingsModel>({
    error: new ErrorModel('Payment required by backend', ErrorType.serviceSide),
  });
  const change = vi
    .spyOn(repository, 'changeProjectConfigurationWorkStatus')
    .mockResolvedValue(rejection);
  const read = vi.spyOn(repository, 'readSettings');
  expect(
    await controller.changeProjectConfigurationWorkStatus(
      new ChangeProjectConfigurationWorkStatusParams(140, 1, 9),
    ),
  ).toBe(rejection);
  expect(controller.settingsState.value).toBe(before);
  expect(controller.projectExecutionState.value.error?.displayMessage).toBe(
    'Payment required by backend',
  );
  expect(change).toHaveBeenCalledTimes(1);
  expect(read).not.toHaveBeenCalled();
});

it('keeps the confirmed response if the follow-up read fails and signals refresh failure', async () => {
  const updated = configuration(1, 9);
  vi.spyOn(repository, 'changeProjectConfigurationWorkStatus').mockResolvedValue(
    new DataSuccess({ data: updated }),
  );
  vi.spyOn(repository, 'readSettings').mockResolvedValue(
    new DataFailed({ error: new ErrorModel('Read failed', ErrorType.serviceSide) }),
  );
  await controller.changeProjectConfigurationWorkStatus(
    new ChangeProjectConfigurationWorkStatusParams(140, 1, 9),
  );
  expect(controller.settingsState.value.data).toBe(updated);
  expect(controller.projectExecutionRefreshFailed.value).toBe(true);
});
