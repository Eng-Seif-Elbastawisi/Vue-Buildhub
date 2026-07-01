import { describe, expect, it } from 'vitest';
import OrganizationEmployeeModel from '../employee.model';

const employeeJson = {
  id: 10,
  name: 'Jane Admin',
  email: 'jane@example.com',
  phone: '01000000000',
  password: 'secret',
  address: 'Cairo',
};

describe('OrganizationEmployeeModel', () => {
  it('maps employee JSON and freezes the instance', () => {
    const model = OrganizationEmployeeModel.fromJson(employeeJson);

    expect(model).toMatchObject({
      id: employeeJson.id,
      employee_name: employeeJson.name,
      employee_email: employeeJson.email,
      employee_phone: employeeJson.phone,
      employee_password: employeeJson.password,
      address: employeeJson.address,
      name: employeeJson.name,
    });
    expect(Object.isFrozen(model)).toBe(true);
  });

  it('throws for empty JSON and exposes an example', () => {
    expect(() => OrganizationEmployeeModel.fromJson(undefined)).toThrow(
      'Cannot create OrganizationEmployeeModel',
    );
    expect(OrganizationEmployeeModel.example).toBeInstanceOf(OrganizationEmployeeModel);
  });
});
