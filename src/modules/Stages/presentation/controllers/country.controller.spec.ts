import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import StageController from './stage.controller';

vi.mock('@/stores/formsStore', () => ({
  useFormsStore: () => ({ clearFormData: vi.fn() }),
}));

vi.mock('@/router', () => ({
  default: { push: vi.fn() },
  push: vi.fn(),
}));

describe('StageController', () => {
  let controller: StageController;
  let mockRepository: any;

  beforeEach(() => {
    controller = StageController.getInstance();

    mockRepository = {
      index: vi.fn(),
      show: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    vi.spyOn(controller as any, 'repository', 'get').mockReturnValue(mockRepository);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns the same singleton instance', () => {
    const a = StageController.getInstance();
    const b = StageController.getInstance();
    expect(a).toBe(b);
  });
});
