import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import ProjectTypeApiService from '../project-type.api-service';

describe('ProjectTypeApiService', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('returns the same singleton', () => {
    expect(ProjectTypeApiService.getInstance()).toBe(ProjectTypeApiService.getInstance());
  });
});
