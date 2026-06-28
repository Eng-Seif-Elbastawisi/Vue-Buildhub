import { describe, it, expect, vi } from 'vitest';
import ProjectController from '../../presentation/controllers/project.controller';

vi.mock('@/stores/user', () => ({
  useUserStore: vi.fn(() => ({ user: { type: 1 } })),
}));

vi.mock('@/stores/formsStore', () => ({
  useFormsStore: vi.fn(() => ({ clearFormData: vi.fn() })),
}));

vi.mock('@/router', () => ({
  default: { push: vi.fn() },
}));

describe('ProjectController', () => {
  it('should return a singleton instance', () => {
    const instance1 = ProjectController.getInstance();
    const instance2 = ProjectController.getInstance();
    expect(instance1).toBe(instance2);
  });
});
