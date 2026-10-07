import { expect, it } from 'vitest';
import ScheduleOwnerParams from '../schedule.owner.params';
it('keeps Quote identity separate from group identity and one-based destination', () => {
  expect(new ScheduleOwnerParams(101).toMap()).toEqual({ quote_id: 101 });
  expect(new ScheduleOwnerParams(101, 201, 2).toMap()).toEqual({
    quote_id: 101,
    project_timeline_id: 201,
    order: 2,
  });
});
it.each([0, -1, 1.5, NaN, Infinity])('rejects invalid owner and group IDs: %s', (id) => {
  expect(new ScheduleOwnerParams(id).validate().isValid).toBe(false);
  expect(new ScheduleOwnerParams(101, id).validate().isValid).toBe(false);
});
