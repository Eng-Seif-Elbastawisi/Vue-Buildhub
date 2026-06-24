import { describe, expect, it } from 'vitest';
import SupplyController from '../supply.controller';

describe('SupplyController', () => {
  it('returns the same singleton instance', () => {
    expect(SupplyController.getInstance()).toBe(SupplyController.getInstance());
  });
});
