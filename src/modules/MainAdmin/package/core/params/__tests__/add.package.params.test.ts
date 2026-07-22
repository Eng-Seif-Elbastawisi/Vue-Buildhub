import { describe, expect, it } from 'vitest';
import AddPackageParams from '../add.package.params';

describe('AddPackageParams', () => {
  it('serializes the package payload', () => {
    const params = new AddPackageParams({
      duration: 12,
      hasmobild: true,
      hasportal: false,
      projectnumbers: 10,
      employeenumbers: 25,
      price: '999.00',
    });

    expect(params.toMap()).toEqual({
      duration: 12,
      hasmobild: true,
      hasportal: false,
      projectnumbers: 10,
      employeenumbers: 25,
      price: '999.00',
    });
    expect(params.validate().isValid).toBe(true);
  });
});
