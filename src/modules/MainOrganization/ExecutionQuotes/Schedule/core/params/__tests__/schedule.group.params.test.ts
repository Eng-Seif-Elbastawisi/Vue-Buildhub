import { expect, it, vi } from 'vitest';
import ScheduleGroupParams from '../schedule.group.params';
import ProjectTimelineStageParams from '../project.timeline.stage.params';
const form = () => ({
  quoteId: 101,
  title: 'First Fix',
  duration: 6,
  durationType: 1 as const,
  stages: [new ProjectTimelineStageParams(10, [11, 12]), new ProjectTimelineStageParams(20, [21])],
});
it('serializes every nested selection and submits the complete replacement form', () => {
  const fields = form();
  const serialize = vi.spyOn(fields.stages[0], 'toMap');
  expect(new ScheduleGroupParams({ ...fields, groupId: 201 }).toMap()).toEqual({
    quote_id: 101,
    project_timeline_id: 201,
    title: 'First Fix',
    duration: 6,
    duration_type: 1,
    stages: [
      { quote_stage_id: 10, children: [11, 12] },
      { quote_stage_id: 20, children: [21] },
    ],
  });
  expect(serialize).toHaveBeenCalledOnce();
  fields.stages = [new ProjectTimelineStageParams(10, [11])];
  expect(new ScheduleGroupParams({ ...fields, groupId: 201 }).toMap().stages).toEqual([
    { quote_stage_id: 10, children: [11] },
  ]);
});
it.each([0, -1, Infinity, NaN])(
  'rejects nonpositive or nonfinite group duration %s',
  (duration) => {
    expect(new ScheduleGroupParams({ ...form(), duration }).validate().isValid).toBe(false);
  },
);
it.each(
  [
    [],
    [new ProjectTimelineStageParams(0, [])],
    [new ProjectTimelineStageParams(10, [11, 11])],
    [new ProjectTimelineStageParams(10, []), new ProjectTimelineStageParams(10, [])],
    [new ProjectTimelineStageParams(10, [11]), new ProjectTimelineStageParams(20, [11])],
  ].map((stages) => [stages]),
)('rejects invalid or repeated Stage selections', (stages) => {
  expect(new ScheduleGroupParams({ ...form(), stages }).validate().isValid).toBe(false);
});
it('accepts fractional positive durations without imposing a precision and preserves unresolved empty children', () => {
  const params = new ScheduleGroupParams({
    ...form(),
    duration: 0.25,
    stages: [new ProjectTimelineStageParams(10, [])],
  });
  expect(params.validate().isValid).toBe(true);
  expect(params.toMap().stages).toEqual([{ quote_stage_id: 10, children: [] }]);
  expect(new ScheduleGroupParams({ ...form(), title: '   ' }).validate().isValid).toBe(false);
});

it('requires a supported duration unit before serialization is submitted', () => {
  expect(new ScheduleGroupParams({ ...form(), durationType: '' }).validate().isValid).toBe(false);
});
