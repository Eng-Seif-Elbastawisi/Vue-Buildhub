import { describe, expect, it } from 'vitest';
import ProjectFloorApiService from '../project.floor.api-service';

describe('ProjectFloorApiService', () => {
  it('returns a singleton instance', () => {
    expect(ProjectFloorApiService.getInstance()).toBe(ProjectFloorApiService.getInstance());
  });
});
