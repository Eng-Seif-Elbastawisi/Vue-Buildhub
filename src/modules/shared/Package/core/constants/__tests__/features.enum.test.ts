import { describe, expect, it } from 'vitest';
import { FeaturesKEY, PackageFeatureName, getFeaturesNameKey } from '../features.enum';

describe('shared package features', () => {
  it('keeps numeric keys and API key names aligned', () => {
    expect(FeaturesKEY.NUMBER_OF_EMPLOYEES).toBe(1);
    expect(FeaturesKEY.HAS_MOBILE).toBe(2);
    expect(FeaturesKEY.HAS_PORTAL).toBe(3);
    expect(FeaturesKEY.NUMBER_OF_PROJECTS).toBe(4);
    expect(PackageFeatureName).toEqual({
      NUMBER_OF_EMPLOYEES: 'NUMBER_OF_EMPLOYEES',
      HAS_MOBILE: 'HAS_MOBILE',
      HAS_PORTAL: 'HAS_PORTAL',
      NUMBER_OF_PROJECTS: 'NUMBER_OF_PROJECTS',
    });
  });

  it('maps feature keys to existing translation keys', () => {
    expect(getFeaturesNameKey(FeaturesKEY.HAS_MOBILE)).toBe('package.features.has_mobile');
    expect(getFeaturesNameKey(FeaturesKEY.NUMBER_OF_PROJECTS)).toBe(
      'package.features.number_of_projects',
    );
  });
});
