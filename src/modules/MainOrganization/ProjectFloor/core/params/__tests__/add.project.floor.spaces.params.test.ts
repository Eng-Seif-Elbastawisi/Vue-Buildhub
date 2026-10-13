import { expect, it } from 'vitest';
import AddProjectFloorSpaceParams from '../add.project.floor.space.params';
import AddProjectFloorSpacesParams from '../add.project.floor.spaces.params';
it('maps each named subparams row without unrelated owner keys', () => {
  const rows = [
    new AddProjectFloorSpaceParams(13, 6, 4, 3.2, 'Living Room'),
    new AddProjectFloorSpaceParams(14, 2.5, 4, 3.2, ''),
  ];
  const params = new AddProjectFloorSpacesParams(23, rows);
  expect(params.validate().isValid).toBe(true);
  expect(params.toMap()).toEqual({ project_floor_id: 23, spaces: rows.map((row) => row.toMap()) });
});
it.each([
  new AddProjectFloorSpacesParams(23, []),
  new AddProjectFloorSpacesParams(0, [new AddProjectFloorSpaceParams(13, 6, 4, 3.2, '')]),
  new AddProjectFloorSpacesParams(23, [new AddProjectFloorSpaceParams(0, 6, 4, 3.2, '')]),
])('rejects missing rows, floor or Space IDs', (params) =>
  expect(params.validate().isValid).toBe(false),
);
