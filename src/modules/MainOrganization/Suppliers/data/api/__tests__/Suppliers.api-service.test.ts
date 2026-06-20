import { describe, expect, it } from 'vitest';
import SuppliersApiService from '../Suppliers.api-service';

describe('SuppliersApiService', () => {
  it('returns the same singleton instance', () => {
    expect(SuppliersApiService.getInstance()).toBe(SuppliersApiService.getInstance());
  });
});
