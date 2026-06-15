import { describe, expect, it } from 'vitest';
import ProjectApiService from '../project.api-service';
describe('ProjectApiService', () => {
  it('returns the same singleton', () => {
    expect(ProjectApiService.getInstance()).toBe(ProjectApiService.getInstance());
  });
});
