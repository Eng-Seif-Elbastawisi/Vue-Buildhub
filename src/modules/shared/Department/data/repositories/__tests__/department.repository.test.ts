import { describe, expect, it } from 'vitest';
import DepartmentRepository from '../department.repository';

describe('DepartmentRepository', () => {
  it('returns the singleton instance', () => {
    expect(DepartmentRepository.getInstance()).toBe(DepartmentRepository.getInstance());
  });
});
