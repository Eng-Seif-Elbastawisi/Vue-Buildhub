import { describe, expect, it } from 'vitest';
import AddOrganizationParams from '../add.organization.params';

const payload = {
  employee_name: 'Jane Admin',
  employee_email: 'jane@example.com',
  employee_phone: '01000000000',
  employee_password: 'secret',
  address: 'Cairo',
  name: 'Build Hub',
};

describe('AddOrganizationParams', () => {
  it('maps and validates add payloads', () => {
    const params = new AddOrganizationParams(payload);

    expect(params.toMap()).toEqual(payload);
    expect(params.validate().isValid).toBe(true);
  });
});
