import { describe, expect, it } from 'vitest';
import ProjectTypeApiService from '../project-type.api-service';
describe('ProjectTypeApiService', () => {
  it('returns the same singleton', () => {
    expect(ProjectTypeApiService.getInstance()).toBe(ProjectTypeApiService.getInstance());
  });
});
