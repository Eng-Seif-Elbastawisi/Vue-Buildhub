import { describe, expect, it } from 'vitest';
import { isValidSupplierPhone } from '../supplier.phone.validation';

describe('isValidSupplierPhone', () => {
  it.each(['01012345678', '123456789'])('accepts positive digit phone numbers', (phone) => {
    expect(isValidSupplierPhone(phone)).toBe(true);
  });

  it('rejects a negative phone number', () => {
    expect(isValidSupplierPhone('-123456789')).toBe(false);
  });
});
