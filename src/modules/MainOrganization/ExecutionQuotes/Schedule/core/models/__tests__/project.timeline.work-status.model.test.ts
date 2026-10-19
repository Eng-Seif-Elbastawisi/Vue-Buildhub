import { expect, it } from 'vitest';
import ProjectTimelineWorkStatusModel from '../project.timeline.work-status.model';
it('maps the small work-status response without expecting a Group resource', () => {
  expect(
    ProjectTimelineWorkStatusModel.fromJson({
      project_timeline_id: 2,
      quote_id: 140,
      work_status: 2,
    }),
  ).toMatchObject({
    projectTimelineId: 2,
    quoteId: 140,
    workStatus: 2,
  });
  expect(() =>
    ProjectTimelineWorkStatusModel.fromJson({ project_timeline_id: 2, quote_id: 140 }),
  ).toThrow();
});
