import { describe, expect, it } from 'vitest';
import ProjectRepository from '../project.repository';
describe('ProjectRepository', () => {
  it('returns the same singleton', () => {
    expect(ProjectRepository.getInstance()).toBe(ProjectRepository.getInstance());
  });
});
