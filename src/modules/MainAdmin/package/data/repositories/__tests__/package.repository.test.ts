import { describe, expect, it } from 'vitest';
import PackageRepository from '../package.repository';

describe('PackageRepository', () => {
  it('returns the same singleton', () => {
    expect(PackageRepository.getInstance()).toBe(PackageRepository.getInstance());
  });
});
