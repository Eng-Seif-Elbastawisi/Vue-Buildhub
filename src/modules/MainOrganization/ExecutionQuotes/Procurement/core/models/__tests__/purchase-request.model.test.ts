import { expect, it } from 'vitest';
import EmployeeModel from '@/modules/MainOrganization/employee/core/models/employee.model';
import PurchaseRequestModel from '../purchase-request.model';
import { requestRecord } from '../../../__tests__/fixtures';
it('separates the creator and assignee and preserves the documented null floor relation', () => {
  const request = PurchaseRequestModel.fromJson(requestRecord());
  expect(request.employee).toBeInstanceOf(EmployeeModel);
  expect(request.employee?.id).toBe(1);
  expect(request.assignedEmployee?.id).toBe(7);
  expect(request.quoteId).toBe(140);
  expect(request.projectId).toBe(86);
  expect(request.projectFloorSpace).toBeNull();
  expect(request.projectFloorSpaceId).toBeNull();
});
it('handles absent optional employee relations and an empty fetched item list', () => {
  const request = PurchaseRequestModel.fromJson({
    ...requestRecord(),
    employee: null,
    assigned_employee: null,
    items: [],
  });
  expect(request.items).toEqual([]);
  expect(request.employee).toBeNull();
  expect(request.assignedEmployee).toBeNull();
});
it('retains an unconfirmed floor relation as opaque data without inferring names', () => {
  const opaque = { backend_extension: 'unconfirmed' };
  const request = PurchaseRequestModel.fromJson({
    ...requestRecord(),
    is_all_project: false,
    project_floor_space_id: 25,
    project_floor_space: opaque,
  });
  expect(request.projectFloorSpace).toBe(opaque);
  expect(request.projectFloorSpaceId).toBe(25);
});
