import { describe, it, expect, vi } from 'vitest';
import ProjectFloorController from '../project.floor.controller';

vi.mock('@/stores/user', () => ({
  useUserStore: vi.fn(() => ({ user: { type: 1 } })),
}));

vi.mock('@/stores/formsStore', () => ({
  useFormsStore: vi.fn(() => ({ clearFormData: vi.fn() })),
}));

vi.mock('@/router', () => ({
  default: { push: vi.fn() },
}));

describe('ProjectFloorController', () => {
  it('should return a singleton instance', () => {
    const instance1 = ProjectFloorController.getInstance();
    const instance2 = ProjectFloorController.getInstance();
    expect(instance1).toBe(instance2);
  });
});
