import { describe, expect, it } from 'vitest';
import ProjectTypeRepository from '../project-type.repository';
describe('ProjectTypeRepository', () => {
  it('returns the same singleton', () => {
    expect(ProjectTypeRepository.getInstance()).toBe(ProjectTypeRepository.getInstance());
  });
});
