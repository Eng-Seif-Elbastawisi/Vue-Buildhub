import { describe, expect, it } from 'vitest';
import ProjectFloorRepository from '../project.floor.repository';

describe('ProjectFloorRepository', () => {
  it('returns a singleton instance', () => {
    expect(ProjectFloorRepository.getInstance()).toBe(ProjectFloorRepository.getInstance());
  });
});
