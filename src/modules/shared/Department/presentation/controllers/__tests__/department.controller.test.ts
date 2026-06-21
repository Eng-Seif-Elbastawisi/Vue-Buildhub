import { describe, expect, it, vi } from 'vitest';
import DepartmentController from '../department.controller';

vi.mock('@/router', () => ({ default: { push: vi.fn() } }));

describe('DepartmentController', () => {
  it('returns the singleton instance', () => {
    expect(DepartmentController.getInstance()).toBe(DepartmentController.getInstance());
  });
});
