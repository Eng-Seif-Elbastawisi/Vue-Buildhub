import { expect, it } from 'vitest';
import EmployeeModel from '@/modules/MainOrganization/employee/core/models/employee.model';
import { employeeReference, responseObject } from '../work-items.response';
it('reuses EmployeeModel mapping of {id,name,type}', () => {
  const employee = employeeReference({ id: 7, name: 'Assignee', type: 2 });
  expect(employee).toBeInstanceOf(EmployeeModel);
  expect(employee.employee_type).toBe(2);
});
it.each([null, [], { id: 0, name: 'Name', type: 1 }, { id: 1, name: 'Name' }])(
  'rejects malformed employee reference',
  (payload) => expect(() => employeeReference(payload)).toThrow('work_items.invalid_response'),
);
it('rejects malformed response objects', () => expect(() => responseObject([])).toThrow());
