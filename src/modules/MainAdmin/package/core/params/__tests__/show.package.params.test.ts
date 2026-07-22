import { describe, expect, it } from 'vitest';
import ShowPackageParams from '../show.package.params';

describe('ShowPackageParams', () => {
  it('serializes package_id', () => {
    expect(new ShowPackageParams(5).toMap()).toEqual({ package_id: 5 });
  });
});
