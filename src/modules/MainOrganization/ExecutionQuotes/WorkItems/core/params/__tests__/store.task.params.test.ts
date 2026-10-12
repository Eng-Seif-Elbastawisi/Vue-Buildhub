import { expect, it } from 'vitest';
import StoreTaskParams from '../store.task.params';
it('serializes timeline stage with optional explicit nulls, without owner IDs', () => {
  expect(new StoreTaskParams(18, 'Electrical').toMap()).toEqual({
    project_timeline_stage_id: 18,
    title: 'Electrical',
    employee_id: null,
    end_date: null,
  });
});
it('keeps date-only value and employee ID', () => {
  const task = new StoreTaskParams(18, ' Electrical ', 7, '2026-10-20');
  expect(task.validate().isValid).toBe(true);
  expect(task.toMap()).toEqual({
    project_timeline_stage_id: 18,
    title: 'Electrical',
    employee_id: 7,
    end_date: '2026-10-20',
  });
});
it.each([
  new StoreTaskParams(0, 'Task'),
  new StoreTaskParams(18, ' '),
  new StoreTaskParams(18, 'Task', -7),
  new StoreTaskParams(18, 'Task', null, '2026-02-30'),
])('rejects invalid task fields', (task) => expect(task.validate().isValid).toBe(false));
