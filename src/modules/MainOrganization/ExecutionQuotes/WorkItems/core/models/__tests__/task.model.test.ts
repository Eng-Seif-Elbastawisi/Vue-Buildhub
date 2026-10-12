import { expect, it } from 'vitest';
import WorkTaskModel from '../task.model';
const task = {
  id: 1,
  project_timeline_stage_id: 18,
  employee: { id: 1, name: 'Creator', type: 1 },
  title: 'Electrical',
  assigned_employee: { id: 7, name: 'Assignee', type: 2 },
  end_date: '2026-10-20',
  created_at: '2026-10-12 07:49:53',
};
it('keeps creator and assignee distinct', () => {
  const mapped = WorkTaskModel.fromJson(task);
  expect(mapped.employee.id).toBe(1);
  expect(mapped.assignedEmployee?.id).toBe(7);
  expect(mapped.projectTimelineStageId).toBe(18);
  expect(mapped.endDate).toBe('2026-10-20');
});
it('preserves nullable assignee/end date', () => {
  const mapped = WorkTaskModel.fromJson({ ...task, assigned_employee: null, end_date: null });
  expect(mapped.assignedEmployee).toBeNull();
  expect(mapped.endDate).toBeNull();
});
it('rejects malformed IDs instead of guessing stage ownership', () =>
  expect(() => WorkTaskModel.fromJson({ ...task, project_timeline_stage_id: null })).toThrow());
