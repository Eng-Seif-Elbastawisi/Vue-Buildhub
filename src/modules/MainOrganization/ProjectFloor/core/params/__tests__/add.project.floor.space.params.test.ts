import { expect, it } from 'vitest';
import AddProjectFloorSpaceParams from '../add.project.floor.space.params';
it.each([0, -1, NaN, Infinity])('rejects invalid numeric dimension %s', (number) => {
  expect(new AddProjectFloorSpaceParams(13, number, 4, 3.2, '').validate().isValid).toBe(false);
});
it('serializes decimal dimensions and the existing Space ID', () => {
  const row = new AddProjectFloorSpaceParams(13, 6, 4, 3.2, 'Living Room');
  expect(row.validate().isValid).toBe(true);
  expect(row.toMap()).toEqual({
    space_id: 13,
    length: 6,
    width: 4,
    height: 3.2,
    notes: 'Living Room',
  });
});
