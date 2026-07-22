import { describe, expect, it } from 'vitest';
import DeletePackageParams from '../delete.package.params';

describe('DeletePackageParams', () => {
  it('serializes package_id', () => {
    expect(new DeletePackageParams(5).toMap()).toEqual({ package_id: 5 });
  });
});
