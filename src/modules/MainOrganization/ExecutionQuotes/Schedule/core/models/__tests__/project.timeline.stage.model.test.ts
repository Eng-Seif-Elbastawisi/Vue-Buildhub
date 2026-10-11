import { expect, it } from 'vitest';
import ProjectTimelineStageModel from '../project.timeline.stage.model';
import ProjectTimelineStageParams from '../../params/project.timeline.stage.params';
import { timelineResponse } from './backend.fixtures';
it('maps dedicated QuoteStage/SubStage response models and converts IDs into subparams only', () => {
  const stage = ProjectTimelineStageModel.fromJson(timelineResponse().stages[0]);
  expect(stage.quoteStageId).toBe(3);
  expect(stage.title).toBe('منعم');
  expect(stage.subStage).toBeNull();
  expect(stage.children[0].subStageId).toBe(4);
  expect(stage.children[0].title).toBe('sub stage');
  const params = new ProjectTimelineStageParams(
    stage.quoteStageId,
    stage.children.map((child) => child.subStageId),
  );
  expect(params.toMap()).toEqual({ quote_stage_id: 3, children: [4] });
});
it('preserves an explicit empty selection without expanding it to all children', () => {
  const stage = ProjectTimelineStageModel.fromJson({
    ...timelineResponse().stages[0],
    children: [],
  });
  expect(stage.children).toEqual([]);
  expect(new ProjectTimelineStageParams(stage.quoteStageId, []).toMap()).toEqual({
    quote_stage_id: 3,
    children: [],
  });
});
it.each([null, undefined])('does not fabricate a child collection for %j', (children) => {
  expect(() =>
    ProjectTimelineStageModel.fromJson({ ...timelineResponse().stages[0], children }),
  ).toThrow('schedule.invalid_response');
});
