import { describe, expect, it } from 'vitest';
import SuppliersController from '../Suppliers.controller';

describe('SuppliersController', () => {
  it('returns the same singleton instance', () => {
    expect(SuppliersController.getInstance()).toBe(SuppliersController.getInstance());
  });
});
