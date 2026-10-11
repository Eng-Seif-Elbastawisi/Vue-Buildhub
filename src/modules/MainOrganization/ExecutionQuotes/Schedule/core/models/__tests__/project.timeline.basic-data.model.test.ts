import { expect, it } from 'vitest';
import ProjectTimelineBasicDataModel from '../project.timeline.basic-data.model';
it('preserves zero count and absent dates without fabricating a finish or status', () => {
  const model = ProjectTimelineBasicDataModel.fromJson({ count_timeline: 0, status: null });
  expect(model.count).toBe(0);
  expect(model.startDate).toBeUndefined();
  expect(model.endDate).toBeUndefined();
  expect(model.status).toBeNull();
  expect(() => ProjectTimelineBasicDataModel.fromJson({})).toThrow();
});
