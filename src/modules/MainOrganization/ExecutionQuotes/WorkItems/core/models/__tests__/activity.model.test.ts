import { expect, it } from 'vitest';
import WorkActivityModel from '../activity.model';
it.each([1, 2, 3, 4])('maps all types from the shared response, type %i', (type) => {
  const activity = WorkActivityModel.fromJson({
    id: 1,
    project_timeline_stage_id: 18,
    employee: { id: 1, name: 'Creator', type: 1 },
    type,
    title: 'Record',
    date: type === 1 ? '2026-10-15' : null,
    description: null,
    assigned_employee: null,
    created_at: null,
  });
  expect(activity.type).toBe(type);
  expect(activity.assignedEmployee).toBeNull();
  expect(activity.description).toBeNull();
  expect(activity.date).toBe(type === 1 ? '2026-10-15' : null);
});
