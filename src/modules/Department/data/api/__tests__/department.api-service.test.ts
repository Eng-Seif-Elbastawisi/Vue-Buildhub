import { describe, expect, it } from 'vitest';
import DepartmentApiService from '../department.api-service';

describe('DepartmentApiService', () => {
  it('returns the singleton instance', () => {
    expect(DepartmentApiService.getInstance()).toBe(DepartmentApiService.getInstance());
  });
});
