import { describe, expect, it } from 'vitest';
import SpecializationController from '../specialization.controller';

describe('SpecializationController', () => {
  it('returns the same singleton', () => {
    expect(SpecializationController.getInstance()).toBe(SpecializationController.getInstance());
  });
});
