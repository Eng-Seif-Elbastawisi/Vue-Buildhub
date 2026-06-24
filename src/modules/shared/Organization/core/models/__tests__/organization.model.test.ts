import { describe, expect, it } from 'vitest';
import OrganizationModel from '../organization.model';

const organizationJson = {
  id: 10,
  employee_name: 'Jane Admin',
  employee_email: 'jane@example.com',
  employee_phone: '01000000000',
  employee_password: 'secret',
  address: 'Cairo',
  name: 'Build Hub',
  default_employee: {
    id: 7,
    name: 'Default Employee',
    email: 'default@example.com',
    phone: '01111111111',
    password: 'secret',
    address: 'Giza',
  },
};

describe('OrganizationModel', () => {
  it('maps organization JSON and freezes the instance', () => {
    const model = OrganizationModel.fromJson(organizationJson);

    expect(model).toMatchObject({
      id: organizationJson.id,
      employee_name: organizationJson.employee_name,
      employee_email: organizationJson.employee_email,
      employee_phone: organizationJson.employee_phone,
      employee_password: organizationJson.employee_password,
      address: organizationJson.address,
      name: organizationJson.name,
      default_employee: {
        id: organizationJson.default_employee.id,
        employee_name: organizationJson.default_employee.name,
        employee_email: organizationJson.default_employee.email,
        employee_phone: organizationJson.default_employee.phone,
        employee_password: organizationJson.default_employee.password,
        address: organizationJson.default_employee.address,
        name: organizationJson.default_employee.name,
      },
    });
    expect(Object.isFrozen(model)).toBe(true);
  });

  it('throws for empty JSON and exposes an example', () => {
    expect(() => OrganizationModel.fromJson(null)).toThrow('Cannot create OrganizationModel');
    expect(OrganizationModel.example).toBeInstanceOf(OrganizationModel);
  });
});
