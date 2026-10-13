import { expect, it } from 'vitest';
import { storeParams } from '../../../__tests__/fixtures';
import PurchaseRequestItemParams from '../purchase-request.item.params';
it.each([true, false])('serializes confirmed fields for is_all_project=%s', (isAllProject) => {
  const params = storeParams({
    isAllProject,
    projectFloorSpaceId: 25,
    items: [
      new PurchaseRequestItemParams(17, 'material', 5, 10),
      new PurchaseRequestItemParams(18, 'product', 36, 5),
    ],
  });
  expect(params.toMap()).toEqual({
    quote_id: 140,
    employee_id: 7,
    is_all_project: isAllProject,
    ...(isAllProject ? {} : { project_floor_space_id: 25 }),
    supply_responsibility: 2,
    priority: 1,
    items: [
      { project_timeline_stage_id: 17, itemable_type: 'material', itemable_id: 5, quantity: 10 },
      { project_timeline_stage_id: 18, itemable_type: 'product', itemable_id: 36, quantity: 5 },
    ],
  });
  expect(params.validate().isValid).toBe(true);
});
it('requires a floor-space association only for specific-space requests', () => {
  const params = storeParams({ isAllProject: false });
  expect(params.validate().errors.map((error) => error.field)).toContain('projectFloorSpaceId');
  params.isAllProject = true;
  expect(params.validate().isValid).toBe(true);
  expect(params.toMap()).not.toHaveProperty('project_floor_space_id');
});
it('validates every line, employee and a nonempty item list', () => {
  const params = storeParams({
    employeeId: 0,
    items: [new PurchaseRequestItemParams(0, 'material', 0, 0)],
  });
  expect(params.validate().errors.map((error) => error.field)).toEqual(
    expect.arrayContaining([
      'employeeId',
      'items.0.projectTimelineStageId',
      'items.0.itemableId',
      'items.0.quantity',
    ]),
  );
  params.items = [];
  expect(params.validate().errors.map((error) => error.field)).toContain('items');
});
