import { expect, it } from 'vitest';
import PurchaseRequestProjectFloorSpaceModel from '../purchase-request.project-floor-space.model';

it.each([
  null,
  [],
  { id: 374 },
  { id: 0, space: { id: 19, title: 'بشسيب' } },
  { id: 374, space: null },
  { id: 374, space: { id: '19', title: 'بشسيب' } },
  { id: 374, space: { id: 19, title: null } },
])('rejects malformed floor-space relations at the response boundary: %j', (relation) => {
  expect(() => PurchaseRequestProjectFloorSpaceModel.fromJson(relation)).toThrow();
});
