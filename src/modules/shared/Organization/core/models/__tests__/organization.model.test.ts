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
};

describe('OrganizationModel', () => {
  it('maps organization JSON and freezes the instance', () => {
    const model = OrganizationModel.fromJson(organizationJson);

    expect(model).toMatchObject(organizationJson);
    expect(Object.isFrozen(model)).toBe(true);
  });

  it('throws for empty JSON and exposes an example', () => {
    expect(() => OrganizationModel.fromJson(null)).toThrow('Cannot create OrganizationModel');
    expect(OrganizationModel.example).toBeInstanceOf(OrganizationModel);
  });
});
