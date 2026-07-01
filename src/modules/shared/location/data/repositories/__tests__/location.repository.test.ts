import { describe, expect, it } from 'vitest';
import LocationRepository from '../location.repository';

describe('LocationRepository', () => {
  it('returns the same singleton', () => {
    expect(LocationRepository.getInstance()).toBe(LocationRepository.getInstance());
  });
});
