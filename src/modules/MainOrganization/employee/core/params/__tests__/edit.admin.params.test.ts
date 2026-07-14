import { describe, expect, it } from 'vitest';
import { EmployeeType } from '../../constants/type.enum';
import EditEmployeeParams from '../edit.employee.params';

describe('Employee legacy edit admin params suite', () => {
  it('maps and validates employee update payloads', () => {
    const params = new EditEmployeeParams({
      id: 5,
      name: 'Ali',
      email: 'ali@example.com',
      phone: '20100100100',
      type: EmployeeType.SELLER,
    });

    expect(params.toMap()).toEqual({
      employee_id: 5,
      name: 'Ali',
      email: 'ali@example.com',
      phone: '20100100100',
      password: undefined,
      type: EmployeeType.SELLER,
    });
    expect(params.validate().isValid).toBe(true);
  });

  it('requires employee type selection', () => {
    const params = new EditEmployeeParams({
      id: 5,
      name: 'Ali',
      email: 'ali@example.com',
      phone: '20100100100',
      type: undefined,
    });

    expect(params.validate()).toMatchObject({
      isValid: false,
      errors: [{ field: 'type' }],
    });
  });
});
