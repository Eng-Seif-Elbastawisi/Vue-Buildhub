import { describe, expect, it } from 'vitest';
import SuppliersRepository from '../Suppliers.repository';

describe('SuppliersRepository', () => {
  it('returns the same singleton instance', () => {
    expect(SuppliersRepository.getInstance()).toBe(SuppliersRepository.getInstance());
  });
});
