import { describe, expect, it } from 'vitest';
import SubscribeToPackageParams from '../subscribe.to.package.params';

describe('SubscribeToPackageParams', () => {
  it('serializes only the selected package ID', () => {
    const params = new SubscribeToPackageParams({ package_id: 4 });

    expect(params.toMap()).toEqual({ package_id: 4 });
    expect(params.validate().isValid).toBe(true);
  });

  it.each([0, -1, 1.5])('rejects invalid package ID %s', (packageId) => {
    const params = new SubscribeToPackageParams({ package_id: packageId });

    expect(params.validate().isValid).toBe(false);
  });
});
