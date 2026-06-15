import { describe, expect, it } from 'vitest';
import ProjectController from '../project.controller';
describe('ProjectController', () => {
  it('returns the same singleton', () => {
    expect(ProjectController.getInstance()).toBe(ProjectController.getInstance());
  });
});
