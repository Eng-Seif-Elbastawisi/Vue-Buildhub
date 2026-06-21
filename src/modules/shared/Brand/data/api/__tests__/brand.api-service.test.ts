import { describe, expect, it } from 'vitest';
import BrandApiService from '../brand.api-service';

describe('BrandApiService', () => {
  it('returns the same singleton instance', () => {
    expect(BrandApiService.getInstance()).toBe(BrandApiService.getInstance());
  });
});
