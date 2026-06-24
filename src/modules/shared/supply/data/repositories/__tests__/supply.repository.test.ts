import { describe, expect, it } from 'vitest';
import SupplyRepository from '../supply.repository';

describe('SupplyRepository', () => {
  it('returns the same singleton instance', () => {
    expect(SupplyRepository.getInstance()).toBe(SupplyRepository.getInstance());
  });
});
