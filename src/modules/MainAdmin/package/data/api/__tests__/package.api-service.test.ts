import { describe, expect, it } from 'vitest';
import PackageApiService from '../package.api-service';

describe('PackageApiService', () => {
  it('returns the same singleton', () => {
    expect(PackageApiService.getInstance()).toBe(PackageApiService.getInstance());
  });
});
