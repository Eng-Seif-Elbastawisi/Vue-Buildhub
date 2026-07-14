import { describe, expect, it } from 'vitest';
import { EmployeeType } from '../../constants/type.enum';
import AddEmployeeParams from '../add.employee.params';

describe('AddEmployeeParams', () => {
  it('maps and validates employee create payloads', () => {
    const params = new AddEmployeeParams({
      name: 'Ali',
      email: 'ali@example.com',
      phone: '20100100100',
      password: 'secret123',
      type: EmployeeType.ENGINEER,
    });

    expect(params.toMap()).toEqual({
      name: 'Ali',
      email: 'ali@example.com',
      phone: '20100100100',
      password: 'secret123',
      type: EmployeeType.ENGINEER,
    });
    expect(params.validate().isValid).toBe(true);
  });

  it('requires employee type selection', () => {
    const params = new AddEmployeeParams({
      name: 'Ali',
      email: 'ali@example.com',
      phone: '20100100100',
      password: 'secret123',
      type: undefined as unknown as EmployeeType,
    });

    expect(params.validate()).toMatchObject({
      isValid: false,
      errors: [{ field: 'type' }],
    });
  });
});
