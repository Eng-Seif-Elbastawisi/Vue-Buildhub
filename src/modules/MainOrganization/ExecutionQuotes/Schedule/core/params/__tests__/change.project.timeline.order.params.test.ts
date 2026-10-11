import { expect, it } from 'vitest';
import ChangeProjectTimelineOrderParams from '../change.project.timeline.order.params';
it('serializes only one timeline identity and its one-based destination, without a Quote owner', () => {
  const params = new ChangeProjectTimelineOrderParams(129, 5);
  expect(params.validate().isValid).toBe(true);
  expect(params.toMap()).toEqual({ project_timeline_id: 129, order: 5 });
});
it.each([
  [0, 1],
  [-1, 1],
  [1, 0],
  [1, -1],
  [1, 1.5],
  [NaN, 1],
  [1, Infinity],
])('rejects invalid ID/order %j', (id, order) => {
  expect(new ChangeProjectTimelineOrderParams(id, order).validate().isValid).toBe(false);
});
