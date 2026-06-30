import { describe, expect, it } from 'vitest';
import SpaceRepository from '../space.repository';

describe('SpaceRepository', () => {
  it('returns the same singleton', () => {
    expect(SpaceRepository.getInstance()).toBe(SpaceRepository.getInstance());
  });
});
