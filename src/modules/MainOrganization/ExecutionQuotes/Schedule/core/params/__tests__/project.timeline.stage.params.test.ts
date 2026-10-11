import { expect, it } from 'vitest';
import ProjectTimelineStageParams from '../project.timeline.stage.params';
it('preserves exact Stage selection keys and an explicit empty child array', () => {
  const selection = new ProjectTimelineStageParams(10, []);
  expect(selection.toMap()).toEqual({ quote_stage_id: 10, children: [] });
  const children = [11, 12];
  const mapped = new ProjectTimelineStageParams(10, children).toMap();
  children.push(13);
  expect(mapped).toEqual({ quote_stage_id: 10, children: [11, 12] });
});
