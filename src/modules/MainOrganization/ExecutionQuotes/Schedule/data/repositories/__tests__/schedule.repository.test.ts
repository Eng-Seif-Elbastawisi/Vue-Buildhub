import NetworkService from '@/base/Core/NetworkStructure/networking/networkService';
import { afterEach, expect, it, vi } from 'vitest';
import {
  DataSuccess,
  DataFailed,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import ScheduleRepository from '../schedule.repository';
import ScheduleApiService from '../../api/schedule.api-service';
import ScheduleOwnerParams from '../../../core/params/schedule.owner.params';
import ScheduleGroupParams from '../../../core/params/schedule.group.params';
import ProjectTimelineStageParams from '../../../core/params/project.timeline.stage.params';
import ScheduleSettingsParams from '../../../core/params/schedule.settings.params';
import ChangeProjectTimelineOrderParams from '../../../core/params/change.project.timeline.order.params';
import {
  overviewResponse,
  timelineResponse,
} from '../../../core/models/__tests__/backend.fixtures';
afterEach(() => vi.restoreAllMocks());
it('fetches the confirmed overview envelope and real timeline identity, with no static fallback', async () => {
  const index = vi
    .spyOn(ScheduleApiService.getInstance(), 'index')
    .mockResolvedValue({ statusCode: 200, data: overviewResponse() });
  const state = await ScheduleRepository.getInstance().readOverview(new ScheduleOwnerParams(140));
  expect(state).toBeInstanceOf(DataSuccess);
  expect(state.data?.projectTimelines[0]?.id).toBe(2);
  expect(index.mock.calls[0][0]?.toMap()).toEqual({ quote_id: 140 });
});
it('maps a supplied direct Show item body without inventing an envelope', async () => {
  vi.spyOn(ScheduleApiService.getInstance(), 'show').mockResolvedValue({
    statusCode: 200,
    data: timelineResponse(),
  });
  const state = await ScheduleRepository.getInstance().show(new ScheduleOwnerParams(140, 2));
  expect(state.data?.title).toBe('Main Execution Timeline');
});
it('reads a timeline from the Show envelope through the real API service', async () => {
  const { transportProbe } = await import('../../api/__tests__/schedule.transport.fixtures');
  vi.spyOn(NetworkService.instance, 'post').mockResolvedValue({
    ...transportProbe(),
    data: {
      data: {
        id: 2,
        title: 'Main Execution Timeline',
        duration: 1,
        duration_type: 4,
        stages: [],
      },
    },
  });
  const state = await ScheduleRepository.getInstance().show(new ScheduleOwnerParams(140, 2));
  expect(state).toBeInstanceOf(DataSuccess);
  expect(state.data?.id).toBe(2);
  expect(state.data?.title).toBe('Main Execution Timeline');
});
it.each([null, [], 'invalid body'])('rejects a malformed Show envelope %j', async (body) => {
  const { transportProbe } = await import('../../api/__tests__/schedule.transport.fixtures');
  vi.spyOn(NetworkService.instance, 'post').mockResolvedValue({
    ...transportProbe(),
    data: body,
  });
  const state = await ScheduleRepository.getInstance().show(new ScheduleOwnerParams(140, 2));
  expect(state).toBeInstanceOf(DataFailed);
  expect(state.data).toBeNull();
});
it('rejects missing, failed and malformed Fetch envelopes rather than creating an empty schedule', async () => {
  const index = vi.spyOn(ScheduleApiService.getInstance(), 'index');
  for (const response of [
    { status: false },
    { status: true },
    { status: true, data: { basicData: { count_timeline: 0 } } },
  ]) {
    index.mockResolvedValueOnce({ statusCode: 200, data: response });
    expect(
      await ScheduleRepository.getInstance().readOverview(new ScheduleOwnerParams(140)),
    ).toBeInstanceOf(DataFailed);
  }
});
const groupParams = () =>
  new ScheduleGroupParams({
    quoteId: 140,
    title: 'Main Execution Timeline',
    duration: 1,
    durationType: 4,
    stages: [new ProjectTimelineStageParams(103, [12])],
  });
it.each(['create', 'update', 'delete', 'saveSettings', 'sort'] as const)(
  'uses real %s transport and recognizes message-only success through base handling',
  async (operation) => {
    const api = ScheduleApiService.getInstance();
    const request = vi.spyOn(api, operation).mockResolvedValue({
      statusCode: 200,
      data: { status: true, message: 'Saved' },
    });
    const repository = ScheduleRepository.getInstance();
    const params = groupParams();
    const state =
      operation === 'create'
        ? await repository.create(params)
        : operation === 'update'
          ? await repository.update(new ScheduleGroupParams({ ...params, groupId: 2 }))
          : operation === 'delete'
            ? await repository.delete(new ScheduleOwnerParams(140, 2))
            : operation === 'sort'
              ? await repository.changeProjectTimelineOrder(
                  new ChangeProjectTimelineOrderParams(2, 1),
                )
              : await repository.saveSettings(new ScheduleSettingsParams(140, '2026-10-10', []));
    expect(request).toHaveBeenCalledOnce();
    expect(state).toBeInstanceOf(DataSuccess);
    expect(state.data).toBeNull();
    expect(state.message).toBe('Saved');
  },
);
it('maps a returned Create timeline through the inherited repository parser', async () => {
  vi.spyOn(ScheduleApiService.getInstance(), 'create').mockResolvedValue({
    statusCode: 201,
    data: { status: true, data: timelineResponse() },
  });
  const state = await ScheduleRepository.getInstance().create(groupParams());
  expect(state.data?.id).toBe(2);
  expect(state.data?.stages[0]?.children[0]?.subStageId).toBe(4);
});
it.each(['create', 'update', 'delete', 'saveSettings', 'sort'] as const)(
  'preserves backend rejection for %s rather than reporting success',
  async (operation) => {
    vi.spyOn(ScheduleApiService.getInstance(), operation).mockResolvedValue({
      statusCode: 200,
      data: { status: false, message: 'Not allowed' },
    });
    const repository = ScheduleRepository.getInstance();
    const params = groupParams();
    const state =
      operation === 'create'
        ? await repository.create(params)
        : operation === 'update'
          ? await repository.update(new ScheduleGroupParams({ ...params, groupId: 2 }))
          : operation === 'delete'
            ? await repository.delete(new ScheduleOwnerParams(140, 2))
            : operation === 'sort'
              ? await repository.changeProjectTimelineOrder(
                  new ChangeProjectTimelineOrderParams(2, 1),
                )
              : await repository.saveSettings(new ScheduleSettingsParams(140, '2026-10-10', []));
    expect(state).toBeInstanceOf(DataFailed);
    expect(state.error?.displayMessage).toBe('Not allowed');
  },
);

it('reads the supplied configuration envelope through the real API service', async () => {
  const { transportProbe } = await import('../../api/__tests__/schedule.transport.fixtures');
  vi.spyOn(NetworkService.instance, 'post').mockResolvedValue({
    ...transportProbe(),
    data: {
      data: { id: 1, start_date: '2026-10-29', holidays: [4], created_at: '2026-10-11 08:17:42' },
    },
  });
  const state = await ScheduleRepository.getInstance().readSettings(new ScheduleOwnerParams(140));
  expect(state).toBeInstanceOf(DataSuccess);
  expect(state.data?.startDate).toBe('2026-10-29');
  expect(state.data?.holidays).toEqual([4]);
});
it.each([
  { statusCode: 200, data: {} },
  { statusCode: 200, data: { data: null } },
  { statusCode: 200, data: { data: { start_date: '2026-10-29', holidays: ['4'] } } },
  { statusCode: 500, data: {} },
])('reports an unsuccessful configuration read %j', async (response) => {
  vi.spyOn(ScheduleApiService.getInstance(), 'settings').mockResolvedValue(response);
  const state = await ScheduleRepository.getInstance().readSettings(new ScheduleOwnerParams(140));
  expect(state).toBeInstanceOf(DataFailed);
  expect(state.data).toBeNull();
  expect(state.error?.displayMessage).toBe(
    response.statusCode === 200 ? 'schedule.invalid_response' : 'schedule.load_error',
  );
});
