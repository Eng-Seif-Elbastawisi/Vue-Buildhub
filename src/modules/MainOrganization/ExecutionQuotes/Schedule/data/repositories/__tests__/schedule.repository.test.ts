import { afterEach, expect, it, vi } from 'vitest';
import {
  DataSuccess,
  DataFailed,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import NetworkService from '@/base/Core/NetworkStructure/networking/networkService';
import ScheduleRepository from '../schedule.repository';
import ScheduleApiService from '../../api/schedule.api-service';
import ScheduleOwnerParams from '../../../core/params/schedule.owner.params';
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
it('blocks mutations before transport solely while their success/error schemas remain missing', async () => {
  const post = vi
    .spyOn(NetworkService.instance, 'post')
    .mockRejectedValue(new Error('No live mutations'));
  const repository = ScheduleRepository.getInstance();
  const params = new ScheduleOwnerParams(140, 2);
  const states = [
    await repository.create(params),
    await repository.update(params),
    await repository.delete(params),
    await repository.saveSettings(params),
    await repository.changeProjectTimelineOrder(new ChangeProjectTimelineOrderParams(2, 1)),
  ];
  for (const state of states) {
    expect(state).toBeInstanceOf(DataFailed);
    expect(state.data).toBeNull();
    expect(state.error?.details).toContain('mutation_success');
  }
  expect(post).not.toHaveBeenCalled();
});
