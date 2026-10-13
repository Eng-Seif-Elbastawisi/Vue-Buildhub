import { expect, it } from 'vitest';
import ProjectTimelineSubStageModel from '../project.timeline.sub-stage.model';
import { timelineResponse } from './backend.fixtures';
it('uses the direct child association ID for editing and keeps the nested SubStage as a label', () => {
  const child = ProjectTimelineSubStageModel.fromJson(timelineResponse().stages[0].children[0]);
  expect(child.subStageId).toBe(4);
  expect(child.subStage?.id).toBe(149);
  expect(child.stage?.id).toBe(129);
});
it.each([undefined, null, 0, -1, 1.5, '4'])(
  'rejects invalid direct child ID %j without falling back to the nested SubStage ID',
  (id) => {
    expect(() =>
      ProjectTimelineSubStageModel.fromJson({
        ...timelineResponse().stages[0].children[0],
        quote_sub_stage_id: id,
      }),
    ).toThrow('schedule.invalid_response');
  },
);
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
