import { describe, expect, it } from 'vitest';
import SpecializationRepository from '../specialization.repository';

describe('SpecializationRepository', () => {
  it('returns the same singleton', () => {
    expect(SpecializationRepository.getInstance()).toBe(SpecializationRepository.getInstance());
  });
});
