import { expect, it } from 'vitest';
import ProjectTimelineSubStageModel from '../project.timeline.sub-stage.model';
import { timelineResponse } from './backend.fixtures';
it('uses the nested SubStage ID rather than the surrounding association ID', () => {
  const child = ProjectTimelineSubStageModel.fromJson(timelineResponse().stages[0].children[0]);
  expect(child.subStageId).toBe(149);
  expect(child.subStageId).not.toBe(4);
  expect(child.stage?.id).toBe(129);
});
it.each([null, undefined])(
  'rejects an unsupported missing/null child SubStage instead of inventing its ID: %j',
  (sub_stage) => {
    expect(() =>
      ProjectTimelineSubStageModel.fromJson({
        ...timelineResponse().stages[0].children[0],
        sub_stage,
      }),
    ).toThrow('schedule.invalid_response');
  },
);
