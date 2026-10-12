import { expect, it } from 'vitest';
import StoreActivityParams from '../store.activity.params';
const fields = {
  projectTimelineStageId: 18,
  type: 1,
  title: 'Weekly Meeting',
  date: '2026-10-15',
  description: 'Irrelevant',
  employeeId: 7,
};
it('meeting sends date and omits employee and description', () => {
  const meeting = new StoreActivityParams(fields);
  expect(meeting.validate().isValid).toBe(true);
  expect(meeting.toMap()).toEqual({
    project_timeline_stage_id: 18,
    type: 1,
    title: 'Weekly Meeting',
    date: '2026-10-15',
  });
});
it.each([2, 3, 4])('type %i omits date and preserves null optional fields', (type) => {
  const issue = new StoreActivityParams({
    ...fields,
    type,
    date: null,
    description: null,
    employeeId: null,
  });
  expect(issue.validate().isValid).toBe(true);
  expect(issue.toMap()).toEqual({
    project_timeline_stage_id: 18,
    type,
    title: 'Weekly Meeting',
    description: null,
    employee_id: null,
  });
});
it('requires meeting date, stage, title and documented type', () => {
  for (const patch of [{ date: null }, { projectTimelineStageId: 0 }, { title: ' ' }, { type: 5 }])
    expect(new StoreActivityParams({ ...fields, ...patch }).validate().isValid).toBe(false);
});
