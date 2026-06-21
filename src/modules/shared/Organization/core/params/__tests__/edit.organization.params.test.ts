import { describe, expect, it } from 'vitest';
import EditOrganizationParams from '../edit.organization.params';

const payload = {
  organization_id: 5,
  employee_name: 'Jane Admin',
  employee_email: 'jane@example.com',
  employee_phone: '01000000000',
  employee_password: 'secret',
  address: 'Cairo',
  name: 'Build Hub',
};

describe('EditOrganizationParams', () => {
  it('maps and validates edit payloads', () => {
    const params = new EditOrganizationParams(payload);

    expect(params.toMap()).toEqual(payload);
    expect(params.validate().isValid).toBe(true);
    expect(
      new EditOrganizationParams({ ...payload, organization_id: undefined }).validate().isValid,
    ).toBe(false);
  });
});
