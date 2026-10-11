import { expect, it } from 'vitest';
import ScheduleGroupModel from '../schedule.group.model';
import ProjectTimelineStageParams from '../../params/project.timeline.stage.params';
import { timelineResponse } from './backend.fixtures';

it('enables editing parsed timelines and preserves their saved selection IDs', () => {
  const group = ScheduleGroupModel.fromJson(timelineResponse());
  expect(group.selectionsAvailable).toBe(true);
  expect(
    group.stages.map((stage) =>
      new ProjectTimelineStageParams(
        stage.quoteStageId,
        stage.children.map((child) => child.subStageId),
      ).toMap(),
    ),
  ).toEqual([{ quote_stage_id: 3, children: [4] }]);
});
it('does not turn nullable or omitted calculation dates into synthetic dates', () => {
  const group = new ScheduleGroupModel({
    id: 201,
    title: 'First Fix',
    stages: [],
    duration: 6,
    durationType: 1,
    startDate: null,
  });
  expect(group.startDate).toBeNull();
  expect(group.finishDate).toBeUndefined();
});
