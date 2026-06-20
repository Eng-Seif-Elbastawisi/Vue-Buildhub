import { describe, expect, it } from 'vitest';
import BrandRepository from '../brand.repository';

describe('BrandRepository', () => {
  it('returns the same singleton instance', () => {
    expect(BrandRepository.getInstance()).toBe(BrandRepository.getInstance());
  });
});
