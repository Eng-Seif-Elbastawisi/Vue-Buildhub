import { describe, expect, it } from 'vitest';
import BrandController from '../brand.controller';

describe('BrandController', () => {
  it('returns the same singleton instance', () => {
    expect(BrandController.getInstance()).toBe(BrandController.getInstance());
  });
});
