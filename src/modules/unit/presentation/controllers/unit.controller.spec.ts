import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import UnitController from './unit.controller';

vi.mock('@/stores/formsStore', () => ({
  useFormsStore: () => ({ clearFormData: vi.fn() }),
}));

vi.mock('@/router', () => ({
  default: { push: vi.fn() },
  push: vi.fn(),
}));

describe('UnitController', () => {
  let controller: UnitController;
  let mockRepository: any;

  beforeEach(() => {
    controller = UnitController.getInstance();

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
    const a = UnitController.getInstance();
    const b = UnitController.getInstance();
    expect(a).toBe(b);
  });
});
