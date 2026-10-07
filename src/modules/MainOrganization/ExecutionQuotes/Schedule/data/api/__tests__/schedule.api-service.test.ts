import { beforeEach, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { ValidationException } from '@/base/Core/Constants/exceptionConstants';
import NetworkService from '@/base/Core/NetworkStructure/networking/networkService';
import { useUserStore } from '@/stores/user';
import ScheduleApiService from '../schedule.api-service';
import { ScheduleEndpoints } from '../schedule.api.endpoints';
import ChangeProjectTimelineOrderParams from '../../../core/params/change.project.timeline.order.params';
import ScheduleOwnerParams from '../../../core/params/schedule.owner.params';
import ScheduleGroupParams from '../../../core/params/schedule.group.params';
import ProjectTimelineStageParams from '../../../core/params/project.timeline.stage.params';
import ScheduleSettingsParams from '../../../core/params/schedule.settings.params';
import { transportProbe } from './schedule.transport.fixtures';

const api = ScheduleApiService.getInstance();
const group = (groupId?: number) =>
  new ScheduleGroupParams({
    quoteId: 101,
    groupId,
    title: 'First Fix',
    duration: 6,
    durationType: 4,
    stages: [new ProjectTimelineStageParams(10, [11, 12])],
  });
const body = {
  quote_id: 101,
  title: 'First Fix',
  duration: 6,
  duration_type: 4,
  stages: [{ quote_stage_id: 10, children: [11, 12] }],
};
const cases = [
  {
    operation: 'index' as const,
    request: () => api.index(new ScheduleOwnerParams(101)),
    body: { quote_id: 101 },
  },
  {
    operation: 'show' as const,
    request: () => api.show(new ScheduleOwnerParams(101, 201)),
    body: { quote_id: 101, project_timeline_id: 201 },
  },
  { operation: 'create' as const, request: () => api.create(group()), body },
  {
    operation: 'update' as const,
    request: () => api.update(group(201)),
    body: { ...body, project_timeline_id: 201 },
  },
  {
    operation: 'delete' as const,
    request: () => api.delete(new ScheduleOwnerParams(101, 201)),
    body: { quote_id: 101, project_timeline_id: 201 },
  },
  {
    operation: 'sort' as const,
    request: () => api.sort(new ChangeProjectTimelineOrderParams(201, 2)),
    body: { project_timeline_id: 201, order: 2 },
  },
  {
    operation: 'settings' as const,
    request: () => api.settings(new ScheduleOwnerParams(101)),
    body: { quote_id: 101 },
  },
  {
    operation: 'saveSettings' as const,
    request: () => api.saveSettings(new ScheduleSettingsParams(101, '2026-10-09', [])),
    body: { quote_id: 101, start_date: '2026-10-09', holidays: [] },
  },
];
beforeEach(() => {
  vi.restoreAllMocks();
  setActivePinia(createPinia());
  vi.spyOn(NetworkService.instance, 'post').mockResolvedValue(transportProbe());
  for (const method of ['postFormData', 'get', 'patch', 'put', 'delete'] as const) {
    vi.spyOn(NetworkService.instance, method).mockRejectedValue(
      new Error('Unexpected non-JSON POST transport'),
    );
  }
});
it.each(cases)(
  'prepares authenticated draft $operation JSON and preserves an opaque response',
  async (scenario) => {
    const response = await scenario.request();
    const calls = vi.mocked(NetworkService.instance.post).mock.calls;
    expect(calls).toHaveLength(1);
    expect(calls[0]?.[0]).toMatchObject({
      url: new ScheduleEndpoints()[scenario.operation],
      data: scenario.body,
      isAuth: true,
    });
    expect(calls[0]?.[1]?.enableRetry).toBe(false);
    expect(response.data).toEqual({ transport_probe: 'opaque' });
  },
);
it('forces JSON POST, authentication and no retries even if caller options request alternatives', async () => {
  await api.create(group(), {
    useJson: false,
    usePost: false,
    usePut: true,
    auth: false,
    enableRetry: true,
  });
  expect(vi.mocked(NetworkService.instance.post).mock.calls[0]?.[0].isAuth).toBe(true);
  expect(vi.mocked(NetworkService.instance.post).mock.calls[0]?.[1]?.enableRetry).toBe(false);
  expect(NetworkService.instance.postFormData).not.toHaveBeenCalled();
});
it.each([[], [5], [5, 6]].map((days) => [days]))(
  'preserves explicit holidays selections over JSON: %j',
  async (days) => {
    await api.saveSettings(new ScheduleSettingsParams(101, '2026-10-09', days));
    expect(vi.mocked(NetworkService.instance.post).mock.calls[0]?.[0].data).toEqual({
      quote_id: 101,
      start_date: '2026-10-09',
      holidays: days,
    });
  },
);
it('sends the complete edit selection replacement without retaining removed children or stages', async () => {
  const params = group(201);
  params.stages = [new ProjectTimelineStageParams(10, [11])];
  await api.update(params);
  expect(vi.mocked(NetworkService.instance.post).mock.calls[0]?.[0].data).toEqual({
    ...body,
    project_timeline_id: 201,
    stages: [{ quote_stage_id: 10, children: [11] }],
  });
});
it('resolves the active portal prefix at request time', async () => {
  await api.index(new ScheduleOwnerParams(101));
  const store = useUserStore();
  store.$patch({ user: { ...store.user, type: 1 } });
  await api.index(new ScheduleOwnerParams(101));
  const calls = vi.mocked(NetworkService.instance.post).mock.calls;
  expect(calls[0]?.[0].url).toContain('/organization/fetch_project_timelines');
  expect(calls[1]?.[0].url).toContain('/mainportal/fetch_project_timelines');
});
it.each([
  ['index with a group ID', () => api.index(new ScheduleOwnerParams(101, 201))],
  ['show without a group ID', () => api.show(new ScheduleOwnerParams(101))],
  ['create with a persisted group ID', () => api.create(group(201))],
  ['update without a group ID', () => api.update(group())],
  ['delete without a group ID', () => api.delete(new ScheduleOwnerParams(101))],
  ['sort with position zero', () => api.sort(new ChangeProjectTimelineOrderParams(201, 0))],
  ['settings with a group ID', () => api.settings(new ScheduleOwnerParams(101, 201))],
  [
    'settings with three days off',
    () => api.saveSettings(new ScheduleSettingsParams(101, '2026-10-09', [1, 2, 3])),
  ],
  [
    'settings with a duplicate day',
    () => api.saveSettings(new ScheduleSettingsParams(101, '2026-10-09', [5, 5])),
  ],
] as const)('rejects %s before requesting transport', async (_scenario, request) => {
  await expect(request()).rejects.toBeInstanceOf(ValidationException);
  expect(NetworkService.instance.post).not.toHaveBeenCalled();
});
it('does not retry a failed create or turn a network rejection into success', async () => {
  vi.mocked(NetworkService.instance.post).mockRejectedValue(new ValidationException('rejected'));
  await expect(api.create(group())).rejects.toBeInstanceOf(ValidationException);
  expect(NetworkService.instance.post).toHaveBeenCalledOnce();
});
