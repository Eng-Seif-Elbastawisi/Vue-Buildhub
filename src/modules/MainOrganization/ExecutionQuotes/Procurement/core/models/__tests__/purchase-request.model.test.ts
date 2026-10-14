import { expect, it } from 'vitest';
import TitleModel from '@/base/Core/Models/titleModel';
import PurchaseRequestProjectFloorSpaceModel from '../purchase-request.project-floor-space.model';
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
it('maps the floor-space association separately from the nested space ID and title', () => {
  const request = PurchaseRequestModel.fromJson({
    ...requestRecord(),
    is_all_project: false,
    project_floor_space_id: 374,
    project_floor_space: { id: 374, space: { id: 19, title: 'بشسيب' } },
  });
  expect(request.projectFloorSpace).toBeInstanceOf(PurchaseRequestProjectFloorSpaceModel);
  expect(request.projectFloorSpace?.id).toBe(374);
  expect(request.projectFloorSpace?.space).toBeInstanceOf(TitleModel);
  expect(request.projectFloorSpace?.space.id).toBe(19);
  expect(request.projectFloorSpace?.space.title).toBe('بشسيب');
  expect(request.projectFloorSpaceId).toBe(374);
});
it('normalizes an absent optional floor-space relation to null', () => {
  const { project_floor_space: _relation, ...record } = requestRecord();
  const request = PurchaseRequestModel.fromJson(record);
  expect(request.projectFloorSpace).toBeNull();
});
