import { describe, expect, it } from 'vitest';
import ProjectTypeController from '../project-type.controller';
describe('ProjectTypeController', () => {
  it('returns the same singleton', () => {
    expect(ProjectTypeController.getInstance()).toBe(ProjectTypeController.getInstance());
  });
});
