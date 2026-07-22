import { describe, expect, it } from 'vitest';
import EditPackageParams from '../edit.package.params';

describe('EditPackageParams', () => {
  it('includes package_id in the update payload', () => {
    const params = new EditPackageParams({
      id: 7,
      duration: 6,
      hasmobild: false,
      hasportal: true,
      projectnumbers: 4,
      employeenumbers: 8,
      price: '450',
    });

    expect(params.toMap()).toEqual(
      expect.objectContaining({
        package_id: 7,
        duration: 6,
        hasmobild: false,
        hasportal: true,
      }),
    );
    expect(params.validate().isValid).toBe(true);
  });
});
