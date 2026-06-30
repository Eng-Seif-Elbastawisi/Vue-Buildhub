import { describe, expect, it, vi } from 'vitest';
import ProjectPreviewController from '../project.preview.controller';

vi.mock('@/stores/user', () => ({
  useUserStore: vi.fn(() => ({ user: { type: 1 } })),
}));

vi.mock('@/stores/formsStore', () => ({
  useFormsStore: vi.fn(() => ({ clearFormData: vi.fn() })),
}));

vi.mock('@/router', () => ({
  default: { push: vi.fn() },
}));

describe('ProjectPreviewController', () => {
  it('returns a singleton instance', () => {
    expect(ProjectPreviewController.getInstance()).toBe(ProjectPreviewController.getInstance());
  });
});
