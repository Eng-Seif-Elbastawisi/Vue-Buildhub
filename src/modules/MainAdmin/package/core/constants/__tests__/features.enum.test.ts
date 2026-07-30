import { describe, expect, it } from 'vitest';
import { FeaturesKEY, PackageFeatureName } from '../features.enum';

describe('admin package feature compatibility exports', () => {
  it('keeps existing admin imports mapped to the shared contract', () => {
    expect(FeaturesKEY.HAS_PORTAL).toBe(3);
    expect(PackageFeatureName.HAS_PORTAL).toBe('HAS_PORTAL');
  });
});
