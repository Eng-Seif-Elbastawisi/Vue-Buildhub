import { expect, it, vi } from 'vitest';
import TitleModel from '@/base/Core/Models/titleModel';
import { TaskDurationType } from '@/modules/MainOrganization/TaskAssignment/core/constants/taskDurationType.enum';
import ProjectTimelineOverviewModel from '../project.timeline.overview.model';
import { overviewResponse } from './backend.fixtures';
it('maps the actual basicData/list envelope recursively using the existing TitleModel mapper', () => {
  const mapper = vi.spyOn(TitleModel, 'fromMap');
  const model = ProjectTimelineOverviewModel.fromJson(overviewResponse().data);
  expect(model.count).toBe(1);
  expect(model.status).toBeNull();
  expect(model.startDate).toBe('2026-10-10 00:00:00');
  expect(model.endDate).toBeUndefined();
  const timeline = model.projectTimelines[0];
  expect(timeline?.id).toBe(2);
  expect(timeline?.durationType).toBe(TaskDurationType.YEAR);
  expect(timeline?.employee?.title).toBe('Techlab Employee');
  expect(timeline?.stages?.[0]?.subStage).toBeNull();
  expect(timeline?.stages?.[0]?.children?.[0]?.subStageId).toBe(4);
  expect(mapper).toHaveBeenCalledWith({ id: 1, name: 'Techlab Employee' });
  mapper.mockRestore();
});
it('rejects malformed collections and unapproved numeric duration values rather than making empty results', () => {
  expect(() =>
    ProjectTimelineOverviewModel.fromJson({ basicData: { count_timeline: 0 } }),
  ).toThrow();
  const response = overviewResponse();
  response.data.data[0].duration_type = 99;
  expect(() => ProjectTimelineOverviewModel.fromJson(response.data)).toThrow();
});
